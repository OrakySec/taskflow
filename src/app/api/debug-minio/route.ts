import { NextResponse } from 'next/server';
import * as Minio from 'minio';
import { minioClient, BUCKET_NAME } from '@/lib/minio';

export async function GET() {
  try {
    const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
    const portStr = process.env.MINIO_PORT || '9000';
    const port = parseInt(portStr);
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
    
    // Teste 1: Cliente normal
    let bucketExistsResult = null;
    let minioError = null;
    try {
      bucketExistsResult = await minioClient.bucketExists(BUCKET_NAME);
    } catch (e: any) {
      minioError = { message: e.message, code: e.code };
    }

    // Teste 2: Tentar com credenciais padrão (minioadmin)
    let fallbackSuccess = false;
    let fallbackError = null;
    if (minioError) {
      try {
        const fallbackClient = new Minio.Client({
          endPoint,
          port,
          useSSL,
          accessKey: 'minioadmin',
          secretKey: 'minioadmin',
        });
        await fallbackClient.bucketExists(BUCKET_NAME);
        fallbackSuccess = true;
      } catch (e: any) {
        fallbackError = { message: e.message, code: e.code };
      }
    }

    return NextResponse.json({
      config: {
        endPoint,
        port,
        bucketName: BUCKET_NAME,
        accessKey,
        secretKeyLength: secretKey.length,
      },
      connectionTest: {
        success: minioError === null,
        bucketExists: bucketExistsResult,
        error: minioError,
      },
      fallbackTest: {
        tried: minioError !== null,
        successWithMinioAdmin: fallbackSuccess,
        error: fallbackError,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
