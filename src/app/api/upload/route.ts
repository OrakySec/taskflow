import { NextResponse } from 'next/server';
import { minioClient, BUCKET_NAME, ensureBucketExists } from '@/lib/minio';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    // Garantir que o bucket exista
    await ensureBucketExists();

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileExtension = file.name.split('.').pop();
      const objectName = `${uuidv4()}.${fileExtension}`;
      
      await minioClient.putObject(
        BUCKET_NAME,
        objectName,
        buffer,
        file.size,
        { 'Content-Type': file.type }
      );

      // Usando uma rota de proxy para servir o arquivo (ou URL assinada do Minio)
      // Se o bucket for público, poderíamos usar a URL direta:
      // const fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${objectName}`;
      
      // Vamos gerar uma presigned URL válida por 7 dias, mas idealmente você 
      // configuraria o Bucket como "Public" ou faria um proxy pelo Next.js
      const fileUrl = await minioClient.presignedGetObject(BUCKET_NAME, objectName, 7 * 24 * 60 * 60);

      uploadedFiles.push({
        filename: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        mimeType: file.type
      });
    }

    return NextResponse.json({ files: uploadedFiles }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Falha ao processar o upload: ' + (error.message || 'Erro desconhecido') }, { status: 500 });
  }
}
