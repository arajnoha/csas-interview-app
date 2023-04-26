import { Link } from "react-router-dom";

interface Props {
  onBack: () => void;
  seznam: any;
  isLoading: boolean
}


const Bankomaty = ({ onBack, seznam, isLoading }: Props) => {

  if (!isLoading) {
    
   return (
     <>
      <ul>
        {seznam.map((item: any) => <li key={item[0]}>{item[0]}<span>{item[1]}</span></li>)}
      </ul>
     <Link to="/">
      <button type="submit" className="muted" onClick={onBack}>
        Zpět
      </button>
    </Link>
     </>
     )

  } else {
    return (
      <>
      <h3>{seznam}</h3>

      <Link to="/">
      <button type="submit" className="muted" onClick={onBack}>
        Zpět
      </button>
    </Link>
    </>
    )

  }

  

 
};

export default Bankomaty;
