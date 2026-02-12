import Image from "next/image";
import styles from "./CategoriesGrid.module.css";

interface CategoryCardProps {
  title: string;
  description: string;
  badge: "رخام" | "جرانيت" | "كوارتز";
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
    <article
      className={styles.categoryCard}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.imageContainer}>
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          loading="lazy"
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
    </article>
  );
}
