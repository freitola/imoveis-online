// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import styles from './HomePage.module.css'; // Arquivo de estilos para a home
import { FaHome, FaDollarSign, FaRegHandshake } from 'react-icons/fa'; // Ícones para os serviços
import axios from "axios"; // Para fazer as requisições
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Ícones para setas da FAQ

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null); // Controla a abertura das FAQs

  // Função para buscar os imóveis mais caros
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/properties?limit=3&orderBy=price&orderDirection=DESC");
        setFeaturedProperties(response.data.properties);
      } catch (error) {
        console.error("Erro ao buscar os imóveis em destaque", error);
      }
    };
    fetchFeaturedProperties();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index); // Abre ou fecha a pergunta clicada
  };

  return (
    <div className={styles.homeContainer}>
      {/* Seção de Boas-vindas */}
      <section className={styles.heroSection}>
        <h1>Bem-vindo à Imobiliária de Marcelo Braz</h1>
        <p>
          Marcelo Braz, corretor de imóveis desde 2015, apresenta os melhores imóveis do mercado.
          Encontre o imóvel dos seus sonhos com o corretor de confiança.
        </p>
        <a href="#contato" className={styles.ctaButton}>Entre em contato</a>
      </section>

      {/* Seção sobre o corretor */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutImage}>
          <img
            src="/path-to-marcelo-image.jpg"
            alt="Marcelo Braz"
          />
        </div>
        <div className={styles.aboutText}>
          <h2>Sobre Marcelo Braz</h2>
          <p>
            Com mais de 9 anos de experiência no mercado imobiliário, Marcelo Braz é conhecido pela sua ética,
            transparência e compromisso em encontrar o imóvel perfeito para cada cliente. Seja para compra, venda
            ou aluguel, você pode contar com uma assessoria completa e personalizada.
          </p>
          <p>
            Marcelo atua principalmente nas regiões do Santos e São Paulo.
            Sua experiência e conhecimento do mercado o tornam a escolha ideal para quem busca
            qualidade e segurança em suas transações imobiliárias.
          </p>
        </div>
      </section>

      {/* Seção de serviços */}
      <section className={styles.servicesSection}>
        <h2>Nossos Serviços</h2>
        <div className={styles.servicesGrid}>
          <div className={styles.serviceCard}>
            <FaHome className={`${styles.serviceIcon} ${styles.largeIcon}`} /> {/* Ícone maior */}
            <h3>Compra e Venda</h3>
            <p>
              Marcelo oferece suporte completo em todas as etapas do processo de compra e venda de imóveis,
              garantindo segurança e tranquilidade.
            </p>
          </div>
          <div className={styles.serviceCard}>
            <FaDollarSign className={`${styles.serviceIcon} ${styles.largeIcon}`} /> {/* Ícone maior */}
            <h3>Aluguel de Imóveis</h3>
            <p>
              Encontre as melhores opções de aluguel com condições flexíveis e atendimento personalizado.
            </p>
          </div>
          <div className={styles.serviceCard}>
            <FaRegHandshake className={`${styles.serviceIcon} ${styles.largeIcon}`} /> {/* Ícone maior */}
            <h3>Avaliação de Imóveis</h3>
            <p>
              Avaliação detalhada e precisa do valor de mercado do seu imóvel, feita por quem entende do assunto.
            </p>
          </div>
        </div>
      </section>

      {/* Galeria de Imóveis em Destaque */}
      <section className={styles.gallerySection}>
        <h2>Imóveis em Destaque</h2>
        <div className={styles.galleryGrid}>
          {featuredProperties.length > 0 ? (
            featuredProperties.map((property) => (
              <div key={property.id} className={styles.galleryItem}>
                <img src={property.image || "/path-to-placeholder-image.jpg"} alt={property.title} />
                <p>{property.title}</p>
                <p>Preço: R${property.price}</p>
                <p>Localização: {property.location}</p>
              </div>
            ))
          ) : (
            <p>Carregando imóveis em destaque...</p>
          )}
        </div>
      </section>

      {/* Seção de FAQ */}
      <section className={styles.faqSection}>
        <h2>Perguntas Frequentes</h2>
        
        <div className={styles.faqItem}>
          <h4 onClick={() => toggleFAQ(1)} className={styles.faqQuestion}>
            Como posso visualizar os imóveis disponíveis?
            {openFAQ === 1 ? <FaChevronUp className={styles.arrowIcon} /> : <FaChevronDown className={styles.arrowIcon} />}
          </h4>
          {openFAQ === 1 && (
            <div className={styles.faqAnswer}>
              Acesse a página "Imóveis" no menu principal para visualizar todos os imóveis disponíveis. Você pode filtrar os resultados por preço, localização, entre outros critérios.
            </div>
          )}
        </div>

        <div className={styles.faqItem}>
          <h4 onClick={() => toggleFAQ(2)} className={styles.faqQuestion}>
            Como agendo uma visita?
            {openFAQ === 2 ? <FaChevronUp className={styles.arrowIcon} /> : <FaChevronDown className={styles.arrowIcon} />}
          </h4>
          {openFAQ === 2 && (
            <div className={styles.faqAnswer}>
              Após encontrar o imóvel desejado, você pode clicar no botão de contato para agendar uma visita diretamente com Marcelo Braz. Você será redirecionado para uma conversa no WhatsApp.
            </div>
          )}
        </div>

        <div className={styles.faqItem}>
          <h4 onClick={() => toggleFAQ(3)} className={styles.faqQuestion}>
            Quais serviços estão disponíveis?
            {openFAQ === 3 ? <FaChevronUp className={styles.arrowIcon} /> : <FaChevronDown className={styles.arrowIcon} />}
          </h4>
          {openFAQ === 3 && (
            <div className={styles.faqAnswer}>
              Oferecemos compra, venda, aluguel e avaliação de imóveis. Você pode contar com nosso suporte completo em todas as etapas do processo.
            </div>
          )}
        </div>

        <div className={styles.faqItem}>
          <h4 onClick={() => toggleFAQ(4)} className={styles.faqQuestion}>
            Como funciona o processo de compra de imóveis?
            {openFAQ === 4 ? <FaChevronUp className={styles.arrowIcon} /> : <FaChevronDown className={styles.arrowIcon} />}
          </h4>
          {openFAQ === 4 && (
            <div className={styles.faqAnswer}>
              O processo de compra envolve desde a visita ao imóvel até a negociação e fechamento do contrato. Marcelo oferece suporte em todas as etapas, garantindo segurança e transparência.
            </div>
          )}
        </div>

        <div className={styles.faqItem}>
          <h4 onClick={() => toggleFAQ(5)} className={styles.faqQuestion}>
            É possível financiar um imóvel?
            {openFAQ === 5 ? <FaChevronUp className={styles.arrowIcon} /> : <FaChevronDown className={styles.arrowIcon} />}
          </h4>
          {openFAQ === 5 && (
            <div className={styles.faqAnswer}>
              Sim, trabalhamos com diversas instituições financeiras que oferecem opções de financiamento. Marcelo pode ajudar a encontrar a melhor solução de financiamento para você.
            </div>
          )}
        </div>

        <div className={styles.faqItem}>
          <h4 onClick={() => toggleFAQ(6)} className={styles.faqQuestion}>
            O que devo considerar ao escolher um imóvel?
            {openFAQ === 6 ? <FaChevronUp className={styles.arrowIcon} /> : <FaChevronDown className={styles.arrowIcon} />}
          </h4>
          {openFAQ === 6 && (
            <div className={styles.faqAnswer}>
              Ao escolher um imóvel, considere a localização, o preço, as condições de financiamento, e o estado do imóvel. Marcelo pode orientá-lo a tomar a melhor decisão.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}