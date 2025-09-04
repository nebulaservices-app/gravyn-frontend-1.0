import React, { useEffect, useState } from 'react';
import styles from './Orbies.module.css'; // Import CSS module for star styling

const Stars = () => {
    const [stars, setStars] = useState([]);

    useEffect(() => {
        const createStars = () => {
            const starCount = 75; // Number of stars
            const newStars = [];
            for (let i = 0; i < starCount; i++) {
                const size = Math.random() *2.5 + 1; // Random size between 1 and 3 pixels
                const top = Math.random() * 80 + '%'; // Random vertical position
                const left = Math.random() * 95 + '%'; // Random horizontal position
                const animationDelay = Math.random() * 2 + 's'; // Random delay between 0 and 5 seconds

                // Smaller stars should have a slower movement speed
                const animationDuration = (25 / (size*1.3)) + 's'; // Inverse relationship between size and duration

                const opacity = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1.0

                newStars.push({
                    id: i,
                    size,
                    top,
                    left,
                    animationDelay,
                    animationDuration,
                    opacity
                });
            }
            setStars(newStars);
        };

        createStars();

        return () => {
            setStars([]);
        };
    }, []);

    return (
        <div className={styles['star-container']} id="starContainer">
            {stars.map(star => (
                <div
                    key={star.id}
                    className={styles.star}
                    style={{
                        width: star.size + 'px',
                        height: star.size + 'px',
                        top: star.top,
                        left: star.left,
                        zIndex: 0,
                        animationDelay: star.animationDelay,
                        animationDuration: star.animationDuration,
                        opacity: star.opacity, // Set opacity based on the star's distance
                        '--opacity-value' : star.opacity
                    }}
                />
            ))}
        </div>
    );
};

export default Stars;
