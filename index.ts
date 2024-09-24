import { uploadToIPFS } from "./utils";

(async function main() {
    const imageHash = await uploadToIPFS("assets/1.png");
})();