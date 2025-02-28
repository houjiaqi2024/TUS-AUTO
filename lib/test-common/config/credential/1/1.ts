import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';
import { UserCertificateCredential } from './types';
import * as forge from 'node-forge';

// 读取本地证书文件并解析
async function loadCertificate(certPath: string, passphrase?: string): Promise<Buffer> {
    // 读取证书文件
    const certBuffer = await fs.promises.readFile(certPath);
    
    // 如果是 pfx 文件，需要加载并解析
    const pfxBuffer = Buffer.from(certBuffer);
    
    // 使用 passphrase 解密 pfx 文件
    if (passphrase) {
        const pfx = forge.pki.privateKeyFromAsn1(forge.asn1.fromDer(pfxBuffer.toString('binary')));
        const cert = forge.pki.createCertificate();
        cert.privateKey = pfx;
        return certBuffer;  // 返回解密后的证书文件
    } else {
        return pfxBuffer;  // 直接返回证书
    }
}
