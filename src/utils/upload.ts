import axios from 'axios';

export async function uploadImagem(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  // 1. COLOQUE O SEU PRESET "UNSIGNED" AQUI
  formData.append('upload_preset', 'SEU_PRESET_AQUI'); 

  try {
    // 2. SUBSTITUA 'demo' PELO SEU CLOUD NAME NO LINK ABAIXO
    const res = await axios.post(
      'https://api.cloudinary.com/v1_1/SEU_CLOUD_NAME/image/upload', 
      formData
    );
    return res.data.secure_url; 
  } catch (error) {
    console.error("Erro detalhado no Cloudinary:", error);
    throw new Error("Falha ao subir imagem");
  }
}