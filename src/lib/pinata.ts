
import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET || '';

const pinataApiUrl = 'https://api.pinata.cloud/pinning';

// Upload file to Pinata and return the IPFS CID
export async function uploadToPinata(file: File, name: string, category: string) {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error("Pinata API keys are not configured");
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  const metadata = JSON.stringify({
    name,
    keyvalues: {
      category,
      uploadDate: new Date().toISOString()
    }
  });
  formData.append('pinataMetadata', metadata);
  
  const options = JSON.stringify({
    cidVersion: 0
  });
  formData.append('pinataOptions', options);
  
  try {
    const res = await axios.post(`${pinataApiUrl}/pinFileToIPFS`, formData, {
      headers: {
        'Content-Type': `multipart/form-data;`,
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET
      }
    });
    
    return res.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
}

// Get file from IPFS by CID
export function getIpfsUrl(cid: string) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

// Fetch the metadata for a file by CID
export async function getMetadata(cid: string) {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error("Pinata API keys are not configured");
  }
  
  try {
    const res = await axios.get(`${pinataApiUrl}/pinList?hashContains=${cid}`, {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET
      }
    });
    
    if (res.data.rows.length > 0) {
      return res.data.rows[0].metadata;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching metadata from Pinata:", error);
    throw error;
  }
}

// Unpin a file from Pinata by CID
export async function unpinFile(cid: string) {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error("Pinata API keys are not configured");
  }
  
  try {
    const res = await axios.delete(`${pinataApiUrl}/unpin/${cid}`, {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET
      }
    });
    
    return res.data;
  } catch (error) {
    console.error("Error unpinning file from Pinata:", error);
    throw error;
  }
}
