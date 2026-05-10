import styles from './admin.module.css';

export const metadata = {
  title: 'Dr. Şenol SuperAdmin | Dashboard',
  description: 'Dr. Şenol Shop Yönetim Paneli',
};

export default function SuperAdminDashboard() {
  return (
    <main className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <h1>Dr. Şenol <span>SuperAdmin</span></h1>
        <p>Sipariş ve mağaza yönetimi - Superblend Serisi</p>
      </header>

      <section className={styles.dashboardGrid}>
        <div className={styles.card}>
          <h3>Bugünkü Satışlar</h3>
          <p className={styles.metric}>₺0.00</p>
        </div>
        <div className={styles.card}>
          <h3>Bekleyen Siparişler</h3>
          <p className={styles.metric}>0</p>
        </div>
        <div className={styles.card}>
          <h3>Aktif Ürünler</h3>
          <p className={styles.metric}>0</p>
        </div>
      </section>
    </main>
  );
}
