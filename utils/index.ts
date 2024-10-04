import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { Connection } from "@solana/web3.js";
import { burn, collectionAddress, create, createCollection, fetchAsset, fetchCollection, mplCore, removePlugin, update } from '@metaplex-foundation/mpl-core'
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
        const collectionAddy = generateSigner(umi);
        console.log("Collection Address: ", collectionAddy.publicKey.toString());
        await createCollection(umi, {
            collection: collectionAddy,
            name: 'Soulbound Mythx',
            uri: '',
        }).sendAndConfirm(umi, TX_CONFIG);
        return collectionAddy;
    } catch (error) {
        console.log("Collection Create Error: ", error);
    }
}

export const createNFT = async (uri: string, collectionAddy: string) => {
    try {
        const assetAddy = generateSigner(umi);
        console.log("Asset Address: ", assetAddy.publicKey.toString());
        const collection = await fetchCollection(umi, publicKey(collectionAddy))
        await create(umi, {
            asset: assetAddy,
            collection: collection,
            payer: payerSigner,
            owner: publicKey(OWNER_PUBKEY),
            name: "Mythx #015",
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

export const updateNFT = async (assetAddy: string, collectionAddy: string) => {
    try {
        const assetId = publicKey(assetAddy);
        const collectionId = publicKey(collectionAddy);
        const asset = await fetchAsset(umi, assetId);
        const collection = await fetchCollection(umi, collectionId)
        await update(umi, {
            asset: asset,
            collection: collection,
            name: 'Mythx #003',
            uri: 'https://gateway.pinata.cloud/ipfs/QmPj5KCEx7fet5XwzCH6crbWb54feVzuioTkivVuaxTBwv',
        }).sendAndConfirm(umi)

    } catch (error) {
        console.log("update error: ", error)
    }
}

export const burnNFT = async (assetAddy: string) => {
    try {
        const asset = await fetchAsset(umi, publicKey(assetAddy));
        const collectionAddy = collectionAddress(asset);
        if (collectionAddy) {
            const collection = await fetchCollection(umi, collectionAddy);
            const result = await burn(umi, {
                asset: asset,
                collection: collection,
            }).sendAndConfirm(umi, TX_CONFIG)
            console.log("Resutls: ", result)
        }
    } catch (error) {
        console.log("Burn Error: ", error)
    }
}

export const removeAssetPlugin = async (assetAddy: string) => {
    try {
        const asset = await fetchAsset(umi, publicKey(assetAddy));
        const collectionAddy = collectionAddress(asset);
        await removePlugin(umi, {
            asset: publicKey(assetAddy),
            collection: collectionAddy,
            plugin: { type: 'PermanentFreezeDelegate' },
        }).sendAndConfirm(umi)
    } catch (error) {
        console.log("Remove plugin Error: ", error);
    }
}