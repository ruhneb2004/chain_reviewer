"use client";
import { jobType, User } from "@/app/dashboard/page";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useWatchContractEvent,
} from "wagmi";
import Alert from "./Alert";
import {
  contractAbi,
  contractAddress,
  subId,
} from "@/app/contract/contractInfo";
import { Log } from "viem";

type JobAmountCalculatedLog = Log & {
  args: {
    dev: string;
    amount: bigint;
  };
};

export const JobCard = ({
  job,
  tab,
  user,
}: {
  job: jobType;
  tab: string;
  user: User;
}) => {
  const account = useAccount();
  const [applied, setApplied] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [devAddress, setDevAddress] = useState("");
  const publicClient = usePublicClient();
  const [alertData, setAlertData] = useState("");
  const [alertStyle, setAlertStyle] = useState("");
  const { data: walletClient } = useWalletClient();
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [completedRepoLink, setCompletedRepoLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [earnableAmount, setEarnableAmount] = useState(0);

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    eventName: "JobAccepted",
    onLogs(logs) {
      console.log("New logs!", logs);
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    eventName: "JobApproved",
    onLogs(logs) {
      console.log("New logs!", logs);
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    eventName: "JobAmountCalculated",
    onLogs: async (logs) => {
      console.log("New logs!", logs);
      const log = logs[0] as JobAmountCalculatedLog;

      if (log && log.args) {
        const amountBigInt = log.args.amount;
        console.log("Earnable amount:", amountBigInt);
        const amount = parseFloat(amountBigInt.toString()) / 1e18;
        setEarnableAmount(amount);

        try {
          console.log("Updating job with earnable amount:", amount);
          const updateJobER = await axios.post("/api/updateJobEA", {
            jobId: job.id,
            earnableReward: amount,
          });
          console.log(updateJobER);
        } catch (err) {
          console.log(err);
        }
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    setApplied(job.appliedDev?.includes(String(account?.address)));
    if (job.earnableReward != 0) {
      setEarnableAmount(job.earnableReward);
    } else {
      setEarnableAmount(0);
    }
  }, []);

  const handleApply = async () => {
    try {
      const applyJob = await axios.post("/api/applyJob", {
        jobId: job.id,
        address: account.address,
      });
      setApplied(true);

      console.log(applyJob);
    } catch (error) {
      console.log(error);
      setShowAlert(true);
      setAlertData("Failed to apply job ❌");
      setAlertStyle("alert-error");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      console.log(job);
    }
  };

  const handleCheckReward = async () => {
    setIsLoading(true);
    try {
      const txn = await walletClient?.writeContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "getAiScore",
        args: [subId],
      });

      const receiept = await publicClient?.waitForTransactionReceipt({
        hash: txn as `0x${string}`,
      });
      console.log(receiept);
      if (receiept?.status === "success") {
        setShowAlert(true);
        setAlertData("Successfully completed job ✅");
        setAlertStyle("alert-success");
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      }
      setCompletedRepoLink("");
      setShowSubmissionModal(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setShowAlert(true);
      setAlertData("Failed to complete job ❌");
      setAlertStyle("alert-error");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  const handleSubmitCompletedWork = async () => {
    setIsLoading(true);
    try {
      const txn = await walletClient?.writeContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "completeJob",
        args: [completedRepoLink],
      });

      const receiept = await publicClient?.waitForTransactionReceipt({
        hash: txn as `0x${string}`,
      });
      console.log(receiept);
      if (receiept?.status === "success") {
        const approveDevDbUpdate = await axios.post("/api/completeJob/", {
          newRepoLink: completedRepoLink,
          jobId: job.id,
        });
        setShowAlert(true);
        setAlertData("Successfully completed job ✅");
        setAlertStyle("alert-success");
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
        console.log(approveDevDbUpdate);
      }
      setIsLoading(false);
      setCompletedRepoLink("");
      setShowSubmissionModal(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setShowAlert(true);
      setAlertData("Failed to complete job ❌");
      setAlertStyle("alert-error");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  const handleJobAccept = async () => {
    setIsLoading(true);
    try {
      const txn = await walletClient?.writeContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "acceptJobCompletion",
        args: [],
      });

      const receiept = await publicClient?.waitForTransactionReceipt({
        hash: txn as `0x${string}`,
      });
      console.log(receiept);
      if (receiept?.status === "success") {
        const updateJobStatus = await axios.post("/api/acceptJobCompletion", {
          jobId: job.id,
        });
        console.log(updateJobStatus);
        setShowAlert(true);
        setAlertData("Successfully accepted job ✅");
        setAlertStyle("alert-success");
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      }
      setCompletedRepoLink("");
      setShowSubmissionModal(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setShowAlert(true);
      setAlertData("Failed to accept job ❌");
      setAlertStyle("alert-error");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const txn = await walletClient?.writeContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "approveDeveloper",
        args: [devAddress],
      });

      const receiept = await publicClient?.waitForTransactionReceipt({
        hash: txn as `0x${string}`,
      });
      console.log(receiept);
      if (receiept?.status === "success") {
        const approveDevDbUpdate = await axios.post("/api/approveDeveloper/", {
          address: devAddress,
          jobId: job.id,
        });
        setShowAlert(true);
        setAlertData("Successfully approved dev ✅");
        setAlertStyle("alert-success");
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
        console.log(approveDevDbUpdate);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setShowAlert(true);
      setIsLoading(false);
      setAlertData("Failed to approve dev ❌");
      setAlertStyle("alert-error");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  return (
    <>
      <Alert showAlert={showAlert} alertData={alertData} style={alertStyle} />

      <div
        key={job.id}
        className="card bg-gradient-to-b from-base-200 to-base-300 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-100 hover:border-primary rounded-2xl"
      >
        <div className="card-body space-y-3">
          <h2 className="card-title text-lg font-semibold text-primary">
            {job.title}
          </h2>
          <p className="text-sm text-gray-400">
            {job.description || "No description provided."}
          </p>
          <p className="text-sm text-gray-400 font-medium">
            💰 {job.reward} ETH
          </p>
          <Link
            className="text-sm text-blue-400 hover:underline break-all"
            href={job.repoLink}
            target="_blank"
          >
            🔗 {job.repoLink}
          </Link>

          {tab === "all" && (
            <div className="card-actions justify-end">
              {user.role === "developer" ? (
                <button
                  className={`btn ${
                    applied ? "btn-success" : "btn-primary"
                  }  btn-sm mt-2 rounded-xl`}
                  onClick={handleApply}
                >
                  {applied ? "✅ Applied" : "Apply"}
                </button>
              ) : (
                <div></div>
              )}
            </div>
          )}

          {tab === "my" && (
            <div className="w-full flex flex-wrap justify-between items-center rounded-lg gap-2">
              <div className="badge badge-success mt-4 text-white py-2 px-3 text-sm rounded-lg">
                {user.role === "developer" ? "✅ Applied" : "✅ Assigned"}
              </div>
              {user.role === "assigner" && job.status === "PENDING" && (
                <span className="flex gap-2 ">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="btn btn-primary btn-sm mt-2 rounded-xl"
                  >
                    See Applied Devs
                  </button>
                  <button
                    onClick={() => {
                      setApproveModalOpen(true);
                    }}
                    className="btn btn-success btn-sm mt-2 rounded-xl"
                  >
                    Approve Developer
                  </button>
                </span>
              )}
              {job.status === "APPROVED" && user.role === "developer" && (
                <button
                  className="btn btn-success btn-sm mt-2 rounded-xl"
                  onClick={() => setShowSubmissionModal(true)}
                >
                  Submit Completed Work
                </button>
              )}
              {job.status === "REWARDABLE" && user.role === "developer" && (
                <div className="flex  items-center gap-3">
                  <div
                    className="btn btn-success btn-sm mt-2 rounded-xl"
                    onClick={handleCheckReward}
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-md"></span>
                    ) : (
                      "Check Reward"
                    )}
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 my-auto ">
                    {" "}
                    {earnableAmount} ETH
                  </div>
                </div>
              )}
              {job.status === "ASSIGNERACCEPTENCEPENDING" &&
                user.role === "assigner" && (
                  <>
                    <label
                      htmlFor="accept-job-modal"
                      className="btn btn-success btn-sm mt-2 rounded-xl"
                    >
                      Accept Job
                    </label>

                    <input
                      type="checkbox"
                      id="accept-job-modal"
                      className="modal-toggle"
                    />
                    <div className="modal">
                      <div className="modal-box rounded-2xl p-6 bg-white shadow-md relative">
                        <label
                          htmlFor="accept-job-modal"
                          className="btn text-black hover:text-white btn-sm btn-circle btn-ghost absolute right-3 top-3"
                        >
                          ✕
                        </label>

                        <h3 className="font-semibold text-xl mb-4 text-gray-800">
                          Review & Accept Job
                        </h3>

                        <div className="text-sm space-y-4 text-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Assigned Reward:
                            </span>
                            <span className="font-mono">{job.reward} ETH</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Dev Earnable Reward:
                            </span>
                            <span className="font-mono text-green-600">
                              {job.earnableReward} ETH
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Dev Repo Link:</span>
                            <a
                              href={job.newRepoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline font-mono truncate max-w-[160px] text-right"
                            >
                              View Repo
                            </a>
                          </div>
                        </div>

                        <div className="modal-action mt-6 flex justify-end gap-2">
                          <label
                            className="btn btn-success btn-sm rounded-md px-4"
                            onClick={handleJobAccept}
                          >
                            {isLoading ? (
                              <span className="loading loading-spinner loading-md"></span>
                            ) : (
                              "Accept"
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              <div>
                Status:{" "}
                <span
                  className={`
                    px-2 py-1 rounded-full text-xs font-semibold
                    ${
                      job.status === "PENDING" &&
                      "bg-yellow-100 text-yellow-800"
                    }
                    ${job.status === "APPROVED" && "bg-blue-100 text-blue-800"}
                    ${
                      job.status === "REWARDABLE" &&
                      "bg-green-100 text-green-800"
                    }
                    ${
                      job.status === "ASSIGNERACCEPTENCEPENDING" &&
                      "bg-yellow-100 text-yellow-800"
                    }

                    ${job.status === "FINISHED" && "bg-gray-200 text-gray-800"}
                  `}
                >
                  {job.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <dialog id="appliedDevsModal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">🧑‍💻 Applied Developers</h3>
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {job.appliedDev && job.appliedDev.length > 0 ? (
                job.appliedDev.map((dev, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 rounded bg-base-200 text-sm text-gray-300"
                  >
                    <span className="truncate max-w-[80%]">{dev}</span>
                    <button
                      className="btn btn-xs btn-ghost text-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(dev);
                      }}
                    >
                      Copy
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">
                  No developers have applied yet.
                </p>
              )}
            </div>
            <div className="modal-action">
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-sm btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {approveModalOpen && (
        <dialog id="approveModal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">✅ Approve Developer</h3>
            <input
              type="text"
              placeholder="Enter developer address"
              className="input input-bordered w-full mt-4"
              value={devAddress}
              onChange={(e) => setDevAddress(e.target.value)}
            />
            <div className="modal-action">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleApprove}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-md"></span>
                ) : (
                  "Approve"
                )}
              </button>

              <button
                onClick={() => setApproveModalOpen(false)}
                className="btn btn-sm btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
      {showSubmissionModal && (
        <dialog id="submissionModal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">📦 Submit Completed Work</h3>
            <p className="text-sm text-yellow-400 mb-3 mt-2">
              ⚠️ Make sure the GitHub repo link is{" "}
              <span className="font-semibold">public</span>
            </p>
            <input
              type="url"
              placeholder="Enter public GitHub repo link"
              className="input input-bordered w-full"
              value={completedRepoLink}
              onChange={(e) => setCompletedRepoLink(e.target.value)}
            />
            <div className="modal-action">
              <button
                onClick={handleSubmitCompletedWork}
                className="btn btn-primary btn-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-md "></span>
                ) : (
                  "Sumbit"
                )}
              </button>
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};
