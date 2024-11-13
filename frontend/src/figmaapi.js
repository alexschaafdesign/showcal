import axios from 'axios';

const FILE_ID = 'NBHU5lsSfPTBMnlFVPxHNB';
const FIGMA_TOKEN = 'figd_9IgwTEDRk2P6kWhTjRvtOmkFcAKniW9pPya9ohwA';

const searchFigmaByName = async (componentName) => {
    try {
        const response = await axios.get(
            `https://api.figma.com/v1/files/${FILE_ID}`,
            {
                headers: { 'X-Figma-Token': FIGMA_TOKEN },
            }
        );

        const components = response.data.meta.components;
        const buttonComponent = components.find(
            (component) => component.name === componentName
        );

        if (buttonComponent) {
            console.log('Found component:', buttonComponent);
            return buttonComponent.node_id;
        } else {
            console.error('Component not found with name:', componentName);
            return null;
        }
    } catch (error) {
        console.error('Error searching component by name:', error);
        throw error;
    }
};

searchFigmaByName('tbuttonlala'); // Replace with actual button name