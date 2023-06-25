import React,{ useState, useEffect, useRef } from 'react'
import { BiPlus, BiComment, BiUser, BiFace, BiSend } from 'react-icons/bi'
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} 
                   variant="filled" {...props} />;
}

function App() {
  const [text, setText] = useState('')
  const [message, setMessage] = useState(null)
  const [previousChats, setPreviousChats] = useState([])
  const [currentTitle, setCurrentTitle] = useState(null)
  const [isResponseLoading, setIsResponseLoading] = useState(false)
  const [isRateLimitError, setIsRateLimitError] = useState(false)
  const [chatType, setChatType] = useState(null) // Adicione esta linha
  const [subLevel, setSubLevel] = useState(null); // Adicione es
  const [atuacao, setAtuacao] = useState('');
  const [acao, setAcao] = useState('');
  const scrollToLastItem = useRef(null)

  const createNewChat = (type, level) => {
    setMessage(null);
    setText("");
    setCurrentTitle(null);
    setChatType(type);
    setSubLevel(level); // Adicione esta linha
    setAtuacao(level ? level.additionalText : '');
    setAcao(level.additionalText1);
    //setSubLevel(level); // Adicione esta linha
   // setAdditionalText(level.additionalText); // Adicione esta linha
  };

  const SubLevelButton = ({ subLevel, onClick }) => {
    return (
      <button
        onClick={onClick}
        style={{
          display: "block",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "5px",
          margin: "5px 0",
          cursor: "pointer",
          background: "#f1f1f1",
          width: "100%",
          textAlign: "center",
        }}
      >
        {subLevel.name}
      </button>
    );
  };
  

  const renderSubLevels = (type) => {
    const subLevels = [
      { name: "Histórias", additionalText: "Haja como um PM ou PO conhecedor do cenário de PBM na RD. Você deve escrever uma história completa para o Jira da squad de PBM, com detalhamento da história, definição de fluxos de testes e demais tópicos necessários para complementar um card no jira. O título do card será o imputado nas próximas conversas. ", additionalText1: "Titulo do Card: " },
      { name: "MS Digital", additionalText: "Haja como um desenvolvedor ou arquiteto de software especialista em PHP Laravel voltado para um serviço Lumém.  " , additionalText1: "Gere um código PHP Laravel voltado para um serviço Lumém, para a seguinte necessidade: "},
      { name: "MS Springboot", additionalText: "Haja como um desenvolvedor ou arquiteto de software especialista em Java Springboot. " , additionalText1: "Gere um código Java Sprintgboot para a seguinte necessidade: " },
      { name: "React Site", additionalText: "Haja como um desenvolvedor ou arquiteto de software especialista em React Site para Front e Node JS (Next) para BFF." , additionalText1: "Gere um código React Site Front e/ou Node JS (Next) para o BFF para a seguinte necessidade: " },
      { name: "ReactNative App", additionalText: "Haja como um desenvolvedor ou arquiteto de software especialista em React APP para Front mobile e Node JS (Next) para BFF." , additionalText1: "" },
      { name: "Testes Unitários", additionalText: "Haja como um desenvolvedor ou arquiteto de software especialista em criação de testes unitários, para a tecnologia do código a seguir." , additionalText1: "Gere teste unitários para o código a seguir: " },
      { name: "Caso de testes", additionalText: "Haja como um desenvolvedor ou arquiteto de software especialista em criação de casos de testes, para a história do card a seguir." , additionalText1: "Gere os casos de testes funcionais e não-funcionais para a seguinte história: " },
      { name: "Testes Automátizados", additionalText: "Haja como um desenvolvedor ou arquiteto de software especialista em criação de testes automátizados, para a tecnologia do código a seguir." , additionalText1: "Gere os casos de testes funcionais automátizados para o seguinte código: " },
    ];

    return (
      <div>
        {subLevels.map((subLevel, index) => (
          <SubLevelButton
            key={index}
            subLevel={subLevel}
            onClick={() => {
              createNewChat(type, subLevel);
            }}
          />
        ))}
      </div>
    );
  };

  const getPromptForChatType = (type, level) => {
    if (type === "PBM") {
      return (
        atuacao  + " "  + " Contexto sobre PBM na RD (Raia Drogasil): Para um cliente comprar no site com desconto é necessário um cadastro nos autorizadores de PBM. O site e app cadastram o usuário na PBM através do serviço digital MSPBM, que se comunica com o IntegradorPBM e com as APIs dos 4 autorizadores. " +  acao
      );
    } else if (type === "OFEX") {
      return "OFEX: " + subLevel?.additionalText + ": ";
    } else {
      return "";
    }
  };

  
  const submitHandler = async (e) => {
    e.preventDefault()
    if (!text) return

    const prompt = getPromptForChatType(chatType,subLevel) // Modifique esta linha


    const options = {
      method: 'POST',
      body: JSON.stringify({
        message: prompt + text, // Modifique esta linha
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }

    try {
      setIsResponseLoading(true)

      const response = await fetch('http://localhost:8000/completions', options)
      const data = await response.json()

      if (data.error) {
        setIsRateLimitError(true)
      } else {
        setIsRateLimitError(false)
      }

      if (!data.error) {
        setMessage(data.choices[0].message)
        setTimeout(() => {
          scrollToLastItem.current?.lastElementChild?.scrollIntoView({
            behavior: 'smooth',
          })
        }, 1)
        setTimeout(() => {
          setText('')
        }, 2)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsResponseLoading(false)
    }
  }

  useEffect(() => {
    if (!currentTitle && text && message) {
      setCurrentTitle(text)
    }

    if (currentTitle && text && message) {
      setPreviousChats((prevChats) => [
        ...prevChats,
        {
          title: currentTitle,
          role: 'user',
          content: text,
        },
        {
          title: currentTitle,
          role: message.role,
          content:
            message.content.charAt(0).toUpperCase() + message.content.slice(1),
        },
      ])
    }
  }, [message, currentTitle])

  const currentChat = previousChats.filter(
    (prevChat) => prevChat.title === currentTitle
  )
  const uniqueTitles = Array.from(
    new Set(previousChats.map((prevChat) => prevChat.title).reverse())
  )

  const convertNewLineToBreak = (text) => {
    return text.split('\n').map((str, index) => (
      <React.Fragment key={index}>
        {str}
        <br />
      </React.Fragment>
    ));
  };

  const backToHistoryPrompt = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
  };

  const buttonStyle = {
    display: "block",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "5px",
    margin: "5px 0",
    cursor: "pointer",
    background: "#f1f1f1",
    width: "100%",
    textAlign: "center",
  };

  return (
    <>
      <div className="container">
        <section className="sidebar">
        <img
            src="https://logospng.org/download/raia-drogasil/logo-raia-drogasil-icon-256.png"
            alt="Raia Drogasil Logo"
            style={{ width: '50px', marginRight: '10px' }}
          />
          <div className="sidebar-header" onClick={() => setChatType("PBM")} role="button" style={buttonStyle}>
            <BiPlus size={20} />
            <button>[PBM]</button>
          </div>  
            {chatType === "PBM" && renderSubLevels("PBM")}
         
          <div className="sidebar-header" onClick={() => setChatType("OFEX")} role="button" style={buttonStyle}>
            <BiPlus size={20} />
            <button>[OFEX]</button>
            </div>  
            {chatType === "OFEX" && renderSubLevels("OFEX")}
          
          <div className="sidebar-history">
            {uniqueTitles.length > 0 && <p>Histórico</p>}
            <ul>
              {uniqueTitles?.map((uniqueTitle, idx) => (
                <li key={idx} onClick={() => backToHistoryPrompt(uniqueTitle)}>
                  <BiComment />
                  {uniqueTitle.slice(0, 18)}
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-info">
            <div className="sidebar-info-upgrade">
              <BiUser />
              <p>Atualizar para o Plus?</p>
            </div>
            <div className="sidebar-info-user">
              <BiFace />
              <p>leonel.costa@gmail.com</p>
            </div>
          </div>
        </section>

        <section className="main">
          {!currentTitle && <h1>RD GPT Terminal</h1>}
          <div className="main-header">
            <ul>
              {currentChat?.map((chatMsg, idx) => (
                <li key={idx} ref={scrollToLastItem}>
                  <img
                    src={
                      chatMsg.role === 'user'
                        ? '../public/face_logo.svg'
                        : '../public/ChatGPT_logo.svg'
                    }
                    alt={chatMsg.role === 'user' ? 'Face icon' : 'ChatGPT icon'}
                    style={{
                      backgroundColor: chatMsg.role === 'user' && '#ECECF1',
                    }}
                  />
                  <p>{convertNewLineToBreak(chatMsg.content)}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="main-bottom">
            {isRateLimitError && (
              <p>
                Rate limit reached for default-gpt-3.5-turbo. Please try again
                in 20s.
              </p>
            )}
            <form className="form-container" onSubmit={submitHandler}>
              <input
                type="text"
                placeholder="Digite sua mensagem."
                spellCheck="false"
                value={
                  isResponseLoading
                    ? 'Carregando...'
                    : text.charAt(0).toUpperCase() + text.slice(1)
                }
                onChange={(e) => setText(e.target.value)}
                readOnly={isResponseLoading}
              />
              {!isResponseLoading && (
                <button type="submit">
                  <BiSend size={20} />
                </button>
              )}
            </form>
            <p>
            Visualização de pesquisa gratuita. ChatGPT pode produzir informações imprecisas. ChatGPT Versão de 3 de maio
            </p>
          </div>
        </section>
      </div>
    </>
  )
}

export default App
