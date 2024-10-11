"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";  // useParams para capturar o parâmetro de rota
import { getPropertyById } from "../../../services/api/propertyService";
import styles from "./PropertyDetail.module.css"; 
import { FaWhatsapp } from "react-icons/fa"; // Importar ícone do WhatsApp

const PropertyDetailsPage = () => {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();  // Captura o parâmetro de rota
  const id = params?.id;  // Pega o 'id' da rota

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id) {
        setError("ID de propriedade inválido");
        setLoading(false);
        return;
      }

      try {
        const data = await getPropertyById(id as string);
        
        if (!data) {
          setError("Imóvel não encontrado.");
        } else {
          setProperty(data);
        }
      } catch (error) {
        setError("Erro ao carregar os detalhes do imóvel.");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return <p>Carregando detalhes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!property) {
    return <p>Imóvel não encontrado.</p>;
  }

  // Criar o link do WhatsApp com a mensagem padronizada
  const corretorPhoneNumber = "5513988675213"; // Número do corretor no formato internacional (exemplo)
  const whatsappMessage = `Olá, estou interessado no imóvel "${property.title}" com os seguintes detalhes:
- Preço: R$${property.price}
- Localização: ${property.location}
- Quartos: ${property.bedrooms}
- Banheiros: ${property.bathrooms}
- Tamanho: ${property.size} m²
Poderia me fornecer mais informações?`;
  
  const whatsappLink = `https://wa.me/${corretorPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className={styles.propertyDetailsContainer}>
      <h1 className={styles.propertyTitle}>{property.title}</h1>
      <div className={styles.propertyDetails}>
        <div className={styles.propertyImage}>
          {property.image ? (
            <img src={`/${property.image}`} alt={property.title} />
          ) : (
            <p className={styles.noImage}>Imagem não disponível</p>
          )}
        </div>
        <div className={styles.propertyInfo}>
          <p><strong>Preço:</strong> R${property.price}</p>
          <p><strong>Localização:</strong> {property.location}</p>
          <p><strong>Quartos:</strong> {property.bedrooms}</p>
          <p><strong>Banheiros:</strong> {property.bathrooms}</p>
          <p><strong>Tamanho:</strong> {property.size} m²</p>
          <p><strong>Tipo:</strong> {property.type}</p>
        </div>
      </div>
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
        <FaWhatsapp /> Contatar via WhatsApp
      </a>
    </div>
  );
};

export default PropertyDetailsPage;