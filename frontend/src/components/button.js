// button.js
import React, { useState, useEffect } from 'react';
import { fetchButtonData, fetchFullFileData } from '../figmaapi.js';
const BUTTON_NODE_ID = '1-1334';

/**
 * Format the button data to keep only relevant properties
 * @param {Object} data - Raw data from Figma API
 * @returns {Object} - Simplified button data
 */
const formatButtonData = (data) => ({
    name: data.name,
    type: data.type,
    color: data.fills?.[0]?.color,
    width: data.absoluteBoundingBox?.width,
    height: data.absoluteBoundingBox?.height,
});

const FigmaButton = () => {
    const [buttonData, setButtonData] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const rawData = await fetchButtonData(BUTTON_NODE_ID);
                const formattedData = formatButtonData(rawData);
                setButtonData(formattedData);
            } catch (error) {
                console.error('Error fetching button data:', error);
            }
        };

        getData();
    }, []);

    return (
        <div>
            {buttonData ? (
                <div>
                    <h3>{buttonData.name}</h3>
                    <p>Type: {buttonData.type}</p>
                    <p>Color: {JSON.stringify(buttonData.color)}</p>
                    <p>Width: {buttonData.width}px, Height: {buttonData.height}px</p>
                </div>
            ) : (
                <p>Loading button data...</p>
            )}
        </div>
    );
};

export default FigmaButton;