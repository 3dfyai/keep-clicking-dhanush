import './MasterButton.css';

export default function MasterButton({ onClick }) {
    return (
        <div className="master-button-container">
            <button className="master-button" onClick={onClick}>
                <span className="button-label">PUSH</span>
            </button>
        </div>
    );
}
