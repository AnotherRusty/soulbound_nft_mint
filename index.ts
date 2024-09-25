import { createNFT, createNFTCollection, uploadMetadata, uploadToIPFS } from "./utils";

(async function main() {
    // const metadataUri = "https://gateway.pinata.cloud/ipfs/Qma8kdVZMEwxhgtR8NQhqNzrCV4Tf22Dnqkqvgd5Eq4o1S";
    const imageUri = await uploadToIPFS("assets/1.png");
    const metadataUri = await uploadMetadata({
        name: "ColCore",
        description: "This is a core NFT made by Rusty",
        image: imageUri!,
    });
    await createNFTCollection();
    await createNFT(metadataUri);
})();