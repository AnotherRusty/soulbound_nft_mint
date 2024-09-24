import { uploadMetadata, uploadToIPFS } from "./utils";

(async function main() {
    const imageHash = await uploadToIPFS("assets/1.png");
    const imageUri = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
    console.log("imageURI ", imageUri)
    
    const metadataHash = await uploadMetadata({
        name: "ColCore",
        description: "This is a core NFT made by Rusty",
        image: imageUri,
    });
    
    const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;
    console.log("matadataURI ", metadataUri);
})();