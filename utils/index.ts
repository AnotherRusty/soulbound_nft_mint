import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { Connection } from "@solana/web3.js";
import { create, createCollection, fetchCollection, mplCore } from '@metaplex-foundation/mpl-core'
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
const collectionAddy = generateSigner(umi);
const assetAddy = generateSigner(umi);

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
        const imageUri = `${PINATA_ORIGIN_URL}/${res.data.IpfsHash}`
        return imageUri;
    } catch (error) {
        console.error('Failed to send request:', error);
    }
};

export const uploadMetadata = async (metadata: METADATA) => {
    const res = await axios.post(PINATA_FILE_URL, metadata, {
        headers: {
            'Authorization': `Bearer ${PINATA_APIKEY}`
        },
    });
    const metadataUri = `${PINATA_ORIGIN_URL}/${res.data.IpfsHash}`;
    return metadataUri;
};

export const createNFTCollection = async () => {
    try {
        console.log("Collection Address: ", collectionAddy.publicKey.toString());
        await createCollection(umi, {
            collection: collectionAddy,
            name: 'SoulboundNFTCollection',
            uri: '',
        }).sendAndConfirm(umi, TX_CONFIG);
    } catch (error) {
        console.log("Collection Create Error: ", error);
    }

}

export const createNFT = async (uri: string) => {
    try {
        console.log("Asset Address: ", assetAddy.publicKey.toString());
        const collection = await fetchCollection(umi, collectionAddy.publicKey)
        await create(umi, {
            asset: assetAddy,
            collection: collection,
            payer: payerSigner,
            owner: publicKey(OWNER_PUBKEY),
            name: 'SMBNFT',
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
        }).sendAndConfirm(umi, TX_CONFIG);
    } catch (error) {
        console.log("Create NFT Error: ", error);
    }
}