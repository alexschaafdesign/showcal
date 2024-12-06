import React, { useEffect, useState } from "react";

const TCUPPeopleProfile = ({ personId }) => {
    const [person, setPerson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPerson = async () => {
            try {
                const response = await fetch(`/api/people/${personId}`);
                const data = await response.json();
                setPerson(data);
            } catch (error) {
                console.error("Error fetching person:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerson();
    }, [personId]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>{person.name}</h1>
            <img src={person.profile_photo} alt={`${person.name}`} />
            <p>{person.bio}</p>
            <h2>Bands</h2>
            <ul>
                {person.bands.map((band) => (
                    <li key={band.id}>{band.name}</li>
                ))}
            </ul>
            <h2>Shows</h2>
            <ul>
                {person.shows.map((show) => (
                    <li key={show.id}>
                        {show.start} - {show.bands}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TCUPPeopleProfile;

