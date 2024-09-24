import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { Connection } from "@solana/web3.js";
import { mplCore } from '@metaplex-foundation/mpl-core'
import { createSignerFromKeypair, keypairIdentity } from '@metaplex-foundation/umi';
import bs58 from "bs58";
import fs from "fs";
import axios from "axios";
import { PINATA_APIKEY, PAYER_PRIVATEKEY, CLUSTERS, TX_CONFIG, PINATA_FILE_URL, PINATA_ORIGIN_URL } from '../config';
import { METADATA } from '../types';

const connection = new Connection(CLUSTERS, TX_CONFIG.confirm);
const umi = createUmi(connection).use(mplCore());
const ut8 = bs58.decode(PAYER_PRIVATEKEY);
const payer = umi.eddsa.createKeypairFromSecretKey(ut8);
const payerSigner = createSignerFromKeypair(umi, payer);
umi.use(keypairIdentity(payerSigner));

export const uploadToIPFS = async (filePath: string) => {
    const data = new FormData();
    data.append("file", fs.createReadStream(filePath));
    try {
         const res = await axios.post(`https://api.pinata.cloud/pinning/pinFileToIPFS`, data, {
            maxContentLength: Infinity,
            headers: {
                "Content-Type": "multipart/form-data",
                'Authorization': `Bearer ${PINATA_APIKEY}`
            },
        });
        console.log(res.data.IpfsHash)
    } catch (error) {
        console.error('Failed to send request:', error);
        throw error;
    }
};

export const uploadMetadata = async (metadata: METADATA) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    const res = await axios.post(url, metadata, {
        headers: {
            'Authorization': `Bearer ${PINATA_APIKEY}`
        },
    });

    return res.data.IpfsHash;
};