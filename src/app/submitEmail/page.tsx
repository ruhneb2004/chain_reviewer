"use client";
import { useState } from "react";
import Alert from "@/components/Alert";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function EmailSubmissionPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const account = useAccount();

  interface FormData {
    email: string;
    role: string;
    address: string;
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    try {
      const formData: FormData = {
        email,
        role,
        address: account.address as `0x${string}`,
      };

      console.log(formData);
      if (account.isConnected) {
        const res = await fetch("/api/submit-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        console.log("Response from server:", res);
        const data = await res.json();
        console.log(data);
        setRole(data.role);
        localStorage.setItem("user", JSON.stringify(data));
        if (data) {
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
            router.push("/dashboard");
          }, 3000);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!account.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
        <div className="card w-full max-w-md bg-base-200 shadow-xl p-8 rounded-3xl space-y-6 text-center">
          <h2 className="text-2xl font-semibold text-primary">
            Wallet not connected
          </h2>
          <p className="text-gray-400">
            Please connect your wallet to continue to Chained_Review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Alert
        showAlert={showAlert}
        alertData={`Once a ${role} always a ${role}`}
        style="alert-info"
      />

      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-10  bg-base-200 rounded-3xl shadow-xl">
          <div className="card-body ">
            <h2 className="card-title text-2xl mb-4">Join Chained_Review</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-control w-full mb-6">
                <label className="label">
                  <span className="label-text">Your Email</span>
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-control mb-8">
                <label className="label">
                  <span className="label-text">I am a:</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      className="radio radio-primary"
                      checked={role === "developer"}
                      onChange={() => setRole("developer")}
                    />
                    <span className="label-text">Developer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      className="radio radio-primary"
                      checked={role === "assigner"}
                      onChange={() => setRole("assigner")}
                    />
                    <span className="label-text">Assigner</span>
                  </label>
                </div>
              </div>

              <div className="card-actions justify-end">
                <button type="submit" className="btn btn-primary w-full">
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
