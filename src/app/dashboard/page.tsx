"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { contractAbi, contractAddress } from "../contract/contractInfo";
import { useWatchContractEvent } from "wagmi";
import Alert from "@/components/Alert";
import { JobCard } from "@/components/jobCard";
import { readContract } from "viem/actions";

export type jobType = {
  id: number;
  title: string;
  description: string;
  reward: number;
  repoLink: string;
  assignerId: string;
  devId: string;
  newRepoLink: string;
  activeJob: boolean;
  status: string;
  earnableReward: number;
  appliedDev: string[];
};

export type User = {
  id: string;
  email: string;
  role: string;
};

export default function Dashboard() {
  const [tab, setTab] = useState("all");
  const [jobs, setJobs] = useState<jobType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState("");
  const [alertStyle, setAlertStyle] = useState("");
  const [bal, setBal] = useState(0);
  const [balModal, setBalModal] = useState(false);

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      const txn = await walletClient?.writeContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: `${
          user?.role === "developer" ? "withdrawDev" : "withdrawAssigner"
        }`,
        args: [],
      });

      const receiept = await publicClient?.waitForTransactionReceipt({
        hash: txn as `0x${string}`,
      });
      console.log(receiept);
      if (receiept?.status === "success") {
        setShowAlert(true);
        setAlertData("Successfully claimed the amount ✅");
        setAlertStyle("alert-success");
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setShowAlert(true);
      setAlertData("Failed to collect the amount ❌");
      setAlertStyle("alert-error");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  const handleBalance = async () => {
    setBalModal(true);
    if (!publicClient) {
      throw new Error("Public client is not initialized");
    }

    const res = await readContract(publicClient, {
      abi: contractAbi,
      address: contractAddress,
      functionName: `${
        user?.role === "developer"
          ? "devToWithdrawableBalance"
          : "assignerToWithdrawableBalance"
      }`,
      args: [walletClient?.account.address],
    });
    setBal(Number(res));
  };

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    reward: "",
    repoLink: "",
  });

  const [user, setUser] = useState<User | null>(null);

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    eventName: "JobAssigned",
    onLogs(logs) {
      console.log("New logs!", logs);
    },
  });

  const fetchAllJob = async () => {
    const allJobs = await axios.get("/api/jobs");
    setJobs(allJobs.data.data);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    fetchAllJob();
  }, []);

  if (!user) {
    return <div className="text-center mt-10">Loading user info...</div>;
  }

  const createJob = async () => {
    try {
      setIsLoading(true);
      const reward = BigInt(parseFloat(newJob.reward) * 1e18);

      const txn = await walletClient?.writeContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "assignJob",
        args: [newJob.title, newJob.description, reward, newJob.repoLink],
        value: reward,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: txn as `0x${string}`,
      });
      console.log("thing");
      console.log(receipt);
      if (receipt?.status === "success") {
        await axios.post("/api/jobs", {
          title: newJob.title,
          description: newJob.description,
          reward: parseFloat(newJob.reward),
          repoLink: newJob.repoLink,
          activeJob: false,
          userId: user?.id,
        });
        setShowAlert(true);
        setAlertData("Job created successfully");
        setAlertStyle("alert-success");
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setShowAlert(true);
        setAlertData("Transaction failed");
        setAlertStyle("alert-error");
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      }

      console.log("hi");

      fetchAllJob();
      setModalOpen(false);
      setNewJob({ title: "", description: "", reward: "", repoLink: "" });
    } catch (err) {
      console.log({ err });
      setIsLoading(false);
      setShowAlert(true);
      setAlertData("Transaction failed");
      setAlertStyle("alert-error");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      setNewJob({ title: "", description: "", reward: "", repoLink: "" });
    }
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6 dark">
      <Alert showAlert={showAlert} alertData={alertData} style={alertStyle} />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4 bg-base-300  h-60 p-4 rounded-2xl shadow-md ">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            Dashboard
          </h2>
          <ul className="menu menu-lg w-full flex gap-3">
            <li>
              <button
                className={`${tab === "all" ? "bg-primary text-white" : ""}`}
                onClick={() => setTab("all")}
              >
                All Jobs
              </button>
            </li>
            <li>
              <button
                className={`${tab === "my" ? "bg-primary text-white" : ""}`}
                onClick={() => setTab("my")}
              >
                My Jobs
              </button>
            </li>
          </ul>
        </div>

        <div className="w-full md:w-3/4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {tab === "all" ? "Available Jobs" : "Your Applications"}
            </h3>
            <div className="flex gap-4 items-center justify-center">
              {" "}
              {user.role === "assigner" && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn btn-primary btn-sm mt-2 rounded-xl"
                >
                  Create Job
                </button>
              )}
              <button
                className="btn btn-primary btn-sm mt-2 rounded-xl"
                onClick={handleBalance}
              >
                Check Available Balance?
              </button>
              {balModal && (
                <dialog id="balance_modal" className="modal modal-open">
                  <div className="modal-box rounded-xl bg-base-200 text-base-content border border-primary shadow-lg">
                    <h3 className="text-md font-semibold text-primary mb-2">
                      Your Balance
                    </h3>

                    <p className="text-sm mb-4">
                      Available to withdraw:{" "}
                      <span className="font-medium text-primary">
                        {bal / 1e18} ETH
                      </span>
                    </p>

                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-sm btn-primary rounded-lg"
                        onClick={handleWithdraw}
                      >
                        {isLoading ? (
                          <span className="loading loading-spinner loading-md"></span>
                        ) : (
                          "Withdraw"
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-white rounded-lg"
                        onClick={() => setBalModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </dialog>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {(tab === "all"
              ? jobs.filter((job) => !job.activeJob)
              : user.role === "assigner"
              ? jobs.filter((job) => job.assignerId === user.id)
              : jobs.filter((job) => job.devId === user.id)
            ).map((job, key) => (
              <JobCard job={job} tab={tab} user={user} key={key} />
            ))}
          </div>
        </div>
      </div>
      {modalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box space-y-4">
            <h3 className="font-bold text-lg">Create a Job</h3>

            <input
              type="text"
              placeholder="Title"
              className="input input-bordered w-full"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="textarea textarea-bordered w-full"
              value={newJob.description}
              onChange={(e) =>
                setNewJob({ ...newJob, description: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Reward (ETH)"
              className="input input-bordered w-full"
              value={newJob.reward}
              onChange={(e) => setNewJob({ ...newJob, reward: e.target.value })}
            />
            <input
              type="text"
              placeholder="Repository Link"
              className="input input-bordered w-full"
              value={newJob.repoLink}
              onChange={(e) =>
                setNewJob({ ...newJob, repoLink: e.target.value })
              }
            />

            <div className="modal-action">
              <button
                onClick={createJob}
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-md"></span>
                ) : (
                  "Submit"
                )}
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setIsLoading(false);
                  setNewJob({
                    title: "",
                    description: "",
                    reward: "",
                    repoLink: "",
                  });
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
