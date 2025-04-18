
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { toast } from "sonner";
import contractABI from "../contracts/ABI";

// This will be replaced with your actual contract address
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

let web3: Web3;
let contract: any;

// Connect to the blockchain and initialize the contract instance
export async function connectToBlockchain() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      contract = new web3.eth.Contract(contractABI as AbiItem[], contractAddress);
      return true;
    } catch (error) {
      console.error("User denied account access");
      return false;
    }
  } else {
    console.error("Please install MetaMask!");
    return false;
  }
}

export async function getWalletAddress() {
  if (!web3) {
    const connected = await connectToBlockchain();
    if (!connected) return null;
  }
  
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

/** 
 * Registers a patient.
 */
export async function registerPatient(
  fullName: string,
  dateOfBirth: string,
  weight: number,
  height: number,
  aadharNumber: string,
  bloodType: string,
  phoneNumber: string,
  isMarried: boolean
) {
  if (!web3 || !contract) await connectToBlockchain();
  const accounts = await web3.eth.getAccounts();
  try {
    const tx = await contract.methods
      .registerPatient(fullName, dateOfBirth, weight, height, aadharNumber, bloodType, phoneNumber, isMarried)
      .send({ from: accounts[0] });
    
    toast.success("Patient registered on blockchain successfully");
    return tx;
  } catch (error) {
    console.error("Error registering patient:", error);
    toast.error("Failed to register patient on blockchain");
    throw error;
  }
}

/** 
 * Registers a doctor.
 */
export async function registerDoctor(name: string, qualification: string, email: string, phone: string) {
  if (!web3 || !contract) await connectToBlockchain();
  const accounts = await web3.eth.getAccounts();
  try {
    const tx = await contract.methods
      .registerDoctor(name, qualification, email, phone)
      .send({ from: accounts[0] });
      
    toast.success("Doctor registered on blockchain successfully");
    return tx;
  } catch (error) {
    console.error("Error registering doctor:", error);
    toast.error("Failed to register doctor on blockchain");
    throw error;
  }
}

/**
 * Uploads a file record to the blockchain.
 */
export async function uploadFile(cid: string, name: string, category: string, dou: string, description: string) {
  if (!web3 || !contract) await connectToBlockchain();
  const accounts = await web3.eth.getAccounts();
  try {
    const tx = await contract.methods
      .uploadFile(cid, name, category, dou, description)
      .send({ from: accounts[0] });
      
    toast.success("File record added to blockchain successfully");
    return tx;
  } catch (error) {
    console.error("Error uploading file:", error);
    toast.error("Failed to add file record to blockchain");
    throw error;
  }
}

/**
 * Adds a daily health report.
 */
export async function addDailyReport(
  recorded_at: string,
  blood_pressure_systolic: number,
  blood_pressure_diastolic: number,
  blood_sugar: number,
  heart_rate: number
) {
  if (!web3 || !contract) await connectToBlockchain();
  const accounts = await web3.eth.getAccounts();
  try {
    const tx = await contract.methods
      .addDailyReport(recorded_at, blood_pressure_systolic, blood_pressure_diastolic, blood_sugar, heart_rate)
      .send({ from: accounts[0] });
      
    toast.success("Vital signs recorded successfully");
    return tx;
  } catch (error) {
    console.error("Error adding daily report:", error);
    toast.error("Failed to record vital signs");
    throw error;
  }
}

/**
 * Grants access to a doctor for the calling patient's records.
 */
export async function grantAccess(doctorAddress: string) {
  if (!web3 || !contract) await connectToBlockchain();
  const accounts = await web3.eth.getAccounts();
  try {
    const tx = await contract.methods
      .grantAccess(doctorAddress)
      .send({ from: accounts[0] });
      
    toast.success("Access granted to doctor successfully");
    return tx;
  } catch (error) {
    console.error("Error granting access:", error);
    toast.error("Failed to grant access to doctor");
    throw error;
  }
}

/**
 * Revokes access from a doctor for the calling patient's records.
 */
export async function revokeAccess(doctorAddress: string) {
  if (!web3 || !contract) await connectToBlockchain();
  const accounts = await web3.eth.getAccounts();
  try {
    const tx = await contract.methods
      .revokeAccess(doctorAddress)
      .send({ from: accounts[0] });
      
    toast.success("Access revoked from doctor successfully");
    return tx;
  } catch (error) {
    console.error("Error revoking access:", error);
    toast.error("Failed to revoke access from doctor");
    throw error;
  }
}

/**
 * Retrieves patient details.
 */
export async function getPatientDetails(patientAddress: string) {
  if (!web3 || !contract) await connectToBlockchain();
  const accounts = await web3.eth.getAccounts();
  try {
    const details = await contract.methods
      .getPatientDetails(patientAddress)
      .call({ from: accounts[0] });
    return details;
  } catch (error) {
    console.error("Error fetching patient details:", error);
    toast.error("Failed to fetch patient details from blockchain");
    throw error;
  }
}

/**
 * Retrieves all file records for a patient.
 */
export async function getFiles(patientAddress: string) {
  if (!web3 || !contract) await connectToBlockchain();
  const accounts = await web3.eth.getAccounts();
  try {
    const files = await contract.methods
      .getFiles(patientAddress)
      .call({ from: accounts[0] });
    return files;
  } catch (error) {
    console.error("Error fetching files:", error);
    toast.error("Failed to fetch files from blockchain");
    throw error;
  }
}

/**
 * Retrieves daily reports for a patient.
 */
export async function getDailyReports(patientAddress: string) {
  if (!web3 || !contract) await connectToBlockchain();
  const accounts = await web3.eth.getAccounts();
  try {
    const reports = await contract.methods
      .getDailyReports(patientAddress)
      .call({ from: accounts[0] });
    return reports;
  } catch (error) {
    console.error("Error fetching daily reports:", error);
    toast.error("Failed to fetch vital signs from blockchain");
    throw error;
  }
}

/**
 * Retrieves details of a doctor.
 */
export async function getDoctorDetails(doctorAddress: string) {
  if (!web3 || !contract) await connectToBlockchain();
  const accounts = await web3.eth.getAccounts();
  try {
    const details = await contract.methods
      .getDoctorDetails(doctorAddress)
      .call({ from: accounts[0] });
    return details;
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    toast.error("Failed to fetch doctor details from blockchain");
    throw error;
  }
}
