import styles from './card.module.css';
function Availablity ({available = true}: {available?: boolean}) {
  return (
    <div >
      {/* Stock availability text removed as requested */}
      {available ? (
        <span className={styles.availableText}></span>
      ) : (
        <span className={styles.unavailableText}>نفذ من المخزون</span>
      )}
    </div>
  );
}
export default Availablity;