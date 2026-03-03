import Image from "next/image";
import styles from "./CategoriesGrid.module.css";

interface CategoryCardProps {
  title: string;
  description: string;
  badge: "رخام" | "جرانيت" | "كوارتز" | "نحت";
  image: string;
  onClick: () => void;
}

export default function CategoryCard({ title, description, badge, image, onClick }: CategoryCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={styles.categoryCard}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${badge}`}
    >
      <div className={styles.imageContainer}>
        <Image
          src={image}
          alt={title}
          width={320}
          height={240}
          sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 768px) calc(50vw - 20px), (max-width: 1024px) calc(33.33vw - 20px), calc(25vw - 20px)"
          loading="lazy"
          quality={55}
          className={styles.categoryImage}
        />
        {/* Hover overlay improves focus on the card title without heavy visuals. */}
        <div className={styles.imageOverlay} aria-hidden="true" />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardHeading}>
          <h3 className={styles.categoryName}>{title}</h3>
          <span className={styles.categoryBadge}>{badge}</span>
        </div>
        <p className={styles.categoryDescription}>{description}</p>
        <button
          type="button"
          className={styles.cardButton}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
        >
          تصفح الآن
          <span className={styles.cardButtonIcon} aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
