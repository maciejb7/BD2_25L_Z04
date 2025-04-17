import React from 'react';
import TextInput from '../common/text-input';


const RegisterForm: React.FC = () => {

    return (
    <form>
        <h2>Rejestracja</h2>
        <TextInput
            type="text"
            name="name"
            placeholder="Imię"
            onChange={(value) => console.log(value)}
            icon="https://img.icons8.com/?size=100&id=66872&format=png&color=000000"
            iconAlt='Imię'
        />
        <TextInput
            type="text"
            name="surname"
            placeholder="Nazwisko"
            onChange={(value) => console.log(value)}
            icon="https://img.icons8.com/?size=100&id=66877&format=png&color=000000"
            iconAlt='Nazwisko'
        />
        <TextInput
            type="text"
            name="nickname"
            placeholder="Nick"
            onChange={(value) => console.log(value)}
            icon="https://img.icons8.com/?size=100&id=43726&format=png&color=1A1A1A"
            iconAlt='Nick'
        />
        <TextInput
            type="email"
            name="email"
            placeholder="Email"
            onChange={(value) => console.log(value)}
            icon="https://img.icons8.com/?size=100&id=66872&format=png&color=000000"
            iconAlt='Email'
        />
        <TextInput
            type="password"
            name="password"
            placeholder="Hasło"
            onChange={(value) => console.log(value)}
            icon="https://img.icons8.com/?size=100&id=43704&format=png&color=000000"
            iconAlt='Hasło'
        />
    </form>
    );
    
};

export default RegisterForm;