import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { Connection } from "@solana/web3.js";
import { create, createCollection, mplCore } from '@metaplex-foundation/mpl-core'
import { createSignerFromKeypair, generateSigner, signerIdentity, publicKey } from '@metaplex-foundation/umi';
import bs58 from "bs58";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { PINATA_APIKEY, PAYER_PRIVATEKEY, CLUSTERS, TX_CONFIG, PINATA_FILE_URL, PINATA_ORIGIN_URL, OWNER_PUBKEY } from '../config';
import { METADATA } from '../types';

const connection = new Connection(CLUSTERS, TX_CONFIG.confirm);
const umi = createUmi(connection).use(mplCore());
const payer = umi.eddsa.createKeypairFromSecretKey(bs58.decode(PAYER_PRIVATEKEY));
const payerSigner = createSignerFromKeypair(umi, payer);
umi.use(signerIdentity(payerSigner));

export const uploadToIPFS = async (filePath: string) => {
    try {
        const data = new FormData();

        data.append("file", fs.createReadStream(filePath));

        const res = await axios.post(PINATA_FILE_URL, data, {
            timeout: 8000,
            maxContentLength: Infinity,
            headers: {
                "Content-Type": `multipart/form-data; boundary=${data.getBoundary()}`,
                'Authorization': `Bearer ${PINATA_APIKEY}`
            },
        });
        const imageUri = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
        return imageUri;
    } catch (error) {
        console.error('Failed to send request:', error);
    }
};

export const uploadMetadata = async (metadata: METADATA) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    const res = await axios.post(url, metadata, {
        headers: {
            'Authorization': `Bearer ${PINATA_APIKEY}`
        },
    });
    const metadataUri = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    return metadataUri;
};

export const createNFT = async (uri: string) => {
    const collectionAddy = generateSigner(umi);
    const assetAddy = generateSigner(umi);
    console.log("==========================================================\n")
    console.log("Collection Address: ", collectionAddy.publicKey.toString());
    console.log("Asset Address: ", assetAddy.publicKey.toString());
    console.log("\n==========================================================")

    await createCollection(umi, {
        collection: collectionAddy,
        name: '',
        uri: '',
    }).sendAndConfirm(umi);

    await create(umi, {
        asset: assetAddy,
        authority: collectionAddy,
        collection: collectionAddy,
        payer: payerSigner,
        owner: publicKey(OWNER_PUBKEY),
        name: 'ColCore',
        uri: uri,
        plugins: [
            {
                type: 'PermanentFreezeDelegate',
                frozen: true,
                authority: {
                    type: "None"
                },
            },
        ]
    }).sendAndConfirm(umi);
}