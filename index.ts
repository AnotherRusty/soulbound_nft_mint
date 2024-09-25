import { createNFT, uploadMetadata, uploadToIPFS } from "./utils";

(async function main() {
    // const imageUri = await uploadToIPFS("assets/1.png");
    // const metadataUri = await uploadMetadata({
    //     name: "ColCore",
    //     description: "This is a core NFT made by Rusty",
    //     image: imageUri,
    // });
    const metadataUri = "https://gateway.pinata.cloud/ipfs/Qma8kdVZMEwxhgtR8NQhqNzrCV4Tf22Dnqkqvgd5Eq4o1S";
    await createNFT(metadataUri);
})();