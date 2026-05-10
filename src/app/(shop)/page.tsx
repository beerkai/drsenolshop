import styles from './page.module.css';

export const metadata = {
  title: 'Dr. Şenol Shop | The Honey Scientist',
  description: 'Doğal Arı Ürünleri ve Superblend Serisi',
};

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>The Honey Scientist</h1>
          <p className={styles.subtitle}>
            Kovandan laboratuvara uzanan bilimsel yolculuk. Dr. Şenol formülüyle hazırlanan, 
            analiz raporlu saf arı ürünlerini keşfedin.
          </p>
          <div className={styles.actions}>
            <a href="/urunler" className="premium-button">Koleksiyonu İncele</a>
          </div>
        </div>
      </section>
    </main>
  );
}
