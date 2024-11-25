import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaSpotify, FaBandcamp, FaGlobe } from 'react-icons/fa';
import { FaSoundcloud, FaWikipediaW } from 'react-icons/fa'; // Import the SoundCloud and Wikipedia icons from React Icons

const BandSocialLinks = ({ links }) => {
  // Map platform names to icons
  const socialIconMap = {
    facebook: FaFacebook,
    twitter: FaTwitter,
    instagram: FaInstagram,
    youtube: FaYoutube,
    spotify: FaSpotify,
    bandcamp: FaBandcamp,
    website: FaGlobe,
    soundcloud: FaSoundcloud, // Use custom icon
    wikipedia: FaWikipediaW, // Use custom Wikipedia icon
  };

  const socialColorMap = {
    facebook: '#1877F2', // Facebook Blue
    twitter: '#1DA1F2', // Twitter Blue
    instagram: '#C13584', // Instagram Gradient (primary pinkish color)
    youtube: '#FF0000', // YouTube Red
    spotify: '#1DB954', // Spotify Green
    bandcamp: '#629AA9', // Bandcamp Blueish
    website: '#000000', // Black for generic website
    soundcloud: '#FF7700', // SoundCloud Orange
    wikipedia: '#000000', // Wikipedia black
  };

  // Define the desired order of platforms
  const platformOrder = [
    'instagram',
    'bandcamp',
    'youtube',
    'spotify',
    'facebook',
    'twitter',
    'soundcloud',
    'wikipedia',
    'website',
  ];

  if (!links || typeof links !== 'object') {
    return <p>No Links</p>; // Handle empty or invalid links
  }

  return (
    <div>
      {Object.entries(links)
        .sort(([a], [b]) => platformOrder.indexOf(a.toLowerCase()) - platformOrder.indexOf(b.toLowerCase())) // Sort based on platformOrder
        .map(([platform, link]) => {
          if (link) {
            const IconComponent = socialIconMap[platform.toLowerCase()] || socialIconMap['website']; // Default to website icon
            const color = socialColorMap[platform.toLowerCase()] || '#000000'; // Default to black

            // Check if IconComponent is a React component (React Icons) or FontAwesomeIcon
            return (
              <a
                key={platform}
                href={link.startsWith('http') ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginRight: '10px', textDecoration: 'none', color: 'inherit' }}
              >
                {React.isValidElement(<IconComponent />) ? (
                  <IconComponent
                    style={{
                      color: color,
                      fontSize: '20px',
                      verticalAlign: 'top',
                      marginTop: '-1px',
                    }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={IconComponent}
                    size="lg"
                    title={platform}
                    style={{
                      color: color,
                      fontSize: '20px',
                    }}
                  />
                )}
              </a>
            );
          }
          return null;
        })}
    </div>
  );
};

export default BandSocialLinks;