import { TransactionBuilderSendAndConfirmOptions } from '@metaplex-foundation/umi';
import dotenv from 'dotenv';

dotenv.config();

export const PINATA_APIKEY = process.env.PINATA_APIKEY!;
export const PAYER_PRIVATEKEY = process.env.PRIVATE_KEY!;
export const OWNER_PUBKEY = process.env.OWNER_PUBKEY!;
export const CLUSTERS = process.env.NET == 'dev' ? 'https://devnet.helius-rpc.com/?api-key=ae825a34-1436-4592-9242-51aa686842e5' : 'https://mainnetbeta-rpc.eclipse.xyz';
export const TX_CONFIG: TransactionBuilderSendAndConfirmOptions = {
    send: { skipPreflight: true },
    confirm: { commitment: 'confirmed' },
};
export const PINATA_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
export const PINATA_ORIGIN_URL = "https://gateway.pinata.cloud/ipfs/";
