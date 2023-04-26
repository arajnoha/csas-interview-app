import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { FieldValues } from "react-hook-form";
import Form from "./components/Form";
import Bankomaty from "./components/Bankomaty";
import Progress from "./components/Progress";
import apiClientCzso from "./services/czso-client";
import apiClientErste from "./services/erste-client";

// kvůli datům ze statistického úřadu
import csvToJson from "csvtojson";

function App() {
  /* 
  nastavíme finální počet kroků, výpočet děláme při předávání Props,
  v komponentě pak vykreslujeme poměrově proces
  */
  const progressSteps: number = 2;

  // Inicializace state hooků
  const [progress, setProgress] = useState<number>(() => {
    const LSprogress = localStorage.getItem('LSprogress');
    return LSprogress ? parseInt(JSON.parse(LSprogress)) : 1;
  });

  const [kraje, setKraje] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(true);

  // stav, kdy teprv chceme effect hookem volat druhé API (jako dependency)
  // aby všechna zátěž požadavků nebyla při FCP (termín z Core Web Vitals)
  const [vybranyKraj, setVybranyKraj] = useState<string>("");

  const [selekceBankomatu, setSelekceBankomatu] = useState<string[]>(() => {
    const LSselekceBankomatu = localStorage.getItem('LSselekceBankomatu');
    return LSselekceBankomatu ? JSON.parse(LSselekceBankomatu) : [];
  });

  const navigate = useNavigate();

  const handleFormSubmit = (data: FieldValues) => {
    setProgress(progress + 1);
    setVybranyKraj(data.kraj);
    navigate("/bankomaty");
  };

  const handleBackButton = () => {
    setProgress(progress - 1);
  };

  // Stavové hooky
  // slouží k načítání pro <Bankomaty />
  useEffect(() => {
    setLoading(false);
  }, [selekceBankomatu]);


  // call pro kraje
  useEffect(() => {

    apiClientCzso
      .get("", { responseType: "blob" })
      .then((response) => {
        const file = response.data;
        const fetchedArray: string[] = [];

        // zřejmě jde o konkrétní endpoint,
        // ale občas se vrací z CZSO neúplná data i když se Promise splní
        file.text().then((string: string) => {
          csvToJson()
            .fromString(string)
            .then((jsonObj) => {
              if (jsonObj.map((item) => fetchedArray.push(item.text)))
                // pro lepší UX
                fetchedArray.shift();
              fetchedArray.sort();

              setKraje([...kraje, ...fetchedArray]);
            });
        });
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Call pro bankomaty
  // Tady je prostor pro zlepšení. Hook je podmíněný změnou state proměnné vybraný kraj, která se kromě přiřazí po vybrání
  // uživatelem ještě zavolá jednou předtím, a to při prvním renderu, kdy vybranyKraj inicializujeme. Proto jsem samotný
  // http požadavek podmíníl ještě tím, že vybranyKraj není prázdný (=je uživatelem vybraný)
  // zároveň ale tuhle závislost chci zachovat, pokud uživatel udělá zpětně změnu výběru
  useEffect(() => {
    if (vybranyKraj) {

      // druhá instance loadingu, předávám ho do podstránky k podmíněnému renderu
      setLoading(true); 
      
      apiClientErste
        .get("")
        .then((response) => {
          const result = response.data.items.filter(
            (atm: any) =>
              atm.type === "ATM" &&
              atm.country === "CZ" &&
              atm.region === vybranyKraj
          );

          const mesta: string[] = [];
          result.forEach((element: any) => {
            mesta.push(element.city);
          });

          const pocetATM: any = {};
          for (const num of mesta) {
            pocetATM[num] = pocetATM[num] ? pocetATM[num] + 1 : 1;
          }

          const arrayedPocetATM: any = Object.keys(pocetATM).map((key) => [key, pocetATM[key]]);

          setSelekceBankomatu(arrayedPocetATM);
        })
        .catch((error) => console.log(error));
    }
  }, [vybranyKraj]);

  // Hooky pro uložení do localStorage, čteme u definice state hooku
  useEffect(() => {
    localStorage.setItem("LSprogress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("LSselekceBankomatu", JSON.stringify(selekceBankomatu));
  }, [selekceBankomatu]);



  return (
    <>
      <div className={isLoading ? "modal is-loading" : "modal"}>
        <header>
          <img
            src="src/assets/img/csu.png"
            alt="Logo Českého statistického úřadu"
          />
          <img src="src/assets/img/erste.png" alt="Logo skupiny Erste" />
        </header>
        <h3>Vyhledávač bankomatů ve vašem kraji</h3>

        <Routes>
          <Route
            path="/"
            element={
              <Form onSubmit={(data) => handleFormSubmit(data)} list={kraje} />
            }
          />
          <Route
            path="/bankomaty"
            element={<Bankomaty onBack={handleBackButton} seznam={selekceBankomatu} isLoading={isLoading}/>}
          />
        </Routes>

        <Progress progressWidth={(progress / progressSteps) * 100}></Progress>
      </div>
    </>
  );
}

export default App;
