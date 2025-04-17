import React from 'react';
import "../../styles/common/text-input.css"

type TextInputProps = {
    type?: string;
    name?: string;
    placeholder?: string;
    icon?: string;
    iconAlt?: string;
    onChange?: (value: string) => void;
    value?: string;
}


const TextInput: React.FC<TextInputProps> = ({type="text", name, placeholder, icon, iconAlt, onChange, value}) => { 
    return (
        <div className="text-input-container">
            <img className="text-input-icon" src={icon} alt={iconAlt}/>
            <input className="text-input" type={type} name={name} placeholder={placeholder} onChange={(e) => onChange && onChange(e.target.value)} value={value}/>
        </div>
    );
}

export default TextInput;