import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LuLogOut } from 'react-icons/lu';
import { IoSearchSharp } from 'react-icons/io5';
import { IoMdAddCircleOutline } from 'react-icons/io';
import ClientCard from '../../components/card/clientCard.tsx';
import NewClient from './newClient.tsx';
import config from '../../common/config.ts';
import axios from 'axios';

interface HomePageProps {
  userType: string;
}

interface ClientDetailsProps {
  client_id: number;
  client_name: string;
  contact_number: string;
  no_of_transactions: number;
  account_status: string;
}

interface ClientListComponentProps {
  clients: ClientDetailsProps[];
  userType: string; 
}

const ClientListComponent: React.FC<ClientListComponentProps> =({ clients, userType }) => {

  const sortedClients = clients.sort((a, b) => a.client_name.localeCompare(b.client_name));

  const organizedClients = [
    ...sortedClients.filter((client) => client.account_status !== 'Deleted'),
    ...sortedClients.filter((client) => client.account_status === 'Deleted'),
  ];

  return (
    <div>
      <ClientCard clients={organizedClients}  userType={userType} />
    </div>
  );
};


const HomePage: React.FC<HomePageProps> = ({ userType }) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<ClientDetailsProps[]>([]);
  const [isNewRecordAdded, setIsNewRecordAdded] = useState(false);
  const [errMess, setErrMess] = useState('');
  const { state } = useLocation();
  const user_Type = state?.userType;

  useEffect(() => {
    axios
      .get(`${config.API}/user/retrieveAll`)
      .then((res) => {
        setClients(res.data.client);
        setIsNewRecordAdded(false);
      })
      .catch((err) => {
        setErrMess(err.response?.data?.message || 'An error occurred');
      });
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
  
    if (trimmedQuery) {
      const words = trimmedQuery.split(' ');
  
      if (words.length === 1) {
        // User is searching by full name, first name, or last name
        axios
          .get(`${config.API}/user/retrieveByParams?col=client_name&val=${trimmedQuery}`)
          .then((res) => {
            setClients(res.data.users);
          })
          .catch((err) => {
            setErrMess(err.response?.data?.message || 'An error occurred');
          });
      } else {
        // User is searching by first name and last name
        const firstName = words[0];
        const lastName = words.slice(1).join(' ');
  
        axios
          .get(`${config.API}/user/retrieveByParams?col=client_name&val=${firstName}&last_name=${lastName}`)
          .then((res) => {
            setClients(res.data.users);
          })
          .catch((err) => {
            setErrMess(err.response?.data?.message || 'An error occurred');
          });
      }
    } else {
      axios
        .get(`${config.API}/user/retrieveAll`)
        .then((res) => {
          setClients(res.data.client);
        })
        .catch((err) => {
          setErrMess(err.response?.data?.message || 'An error occurred');
        });
    }
  };

  const handleNewRecordAdded = () => {
    setIsNewRecordAdded(true);
  };

  useEffect(() => {
    console.log(isNewRecordAdded);
    if (isNewRecordAdded) {
      clients.forEach((client) => {
        axios
          .get(`${config.API}/records/retrieveCount?client_id=${client.client_id}`)
          .then((res) => {
            const transactionCount = res.data.data.transactionCount;
  
            // Update the client state
            setClients((prevClients) => {
              return prevClients.map((prevClient) =>
                prevClient.client_id === client.client_id
                  ? { ...prevClient, no_of_transactions: transactionCount }
                  : prevClient
              );
            });
  
            // Update the transaction count in the client table
            axios
              .put(`${config.API}/user/updateClientSpecific`, {
                client_id: client.client_id,
                no_of_transactions: transactionCount,
              })
              .then((updateRes) => {
                console.log("Transaction count updated in the database:", updateRes.data);
              })
              .catch((updateErr) => {
                console.error('Error updating transaction count in the database:', updateErr);
              });
          })
          .catch((err) => {
            console.error('Error fetching transaction count:', err);
          });
      });
  
      setIsNewRecordAdded(false);
    }
  }, [clients, isNewRecordAdded]);

  return (
    <div className="h-full font-jost bg-[#D8DEDE] animate-fade-in">
      
      {/* Header */}
      <div className="w-full h-[10vh] flex bg-white rounded-xl shadow-xl items-center">
        <div className="text-[2.8em] text-[#595959] font-bold ml-[45%]">
          Client List
        </div>

        <div className="w-[10vw] p-4 ml-[35%] text-[1.5em] text-[#595959] font-semibold hover:text-[#767a40] transition-colors delay-250 duration-[3000] ease-in ">
          <Link to="/">
            <button className="flex w-[100%] p-4">
              <LuLogOut className="mt-[4%] text-[1.2em]" />
              <p className="ml-[10%]">Log Out</p>
            </button>
          </Link>
        </div>
      </div>

      {/* Search & Add Client */}
      <div className="w-full flex mt-[3%] animate-small-fade-in-down">
        <div className="flex group ml-[1.5%]">
          <input
            type="text"
            placeholder="Search for a client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-[25vw] h-[5vh] text-[1.3em] p-[0.2rem] pl-[1rem] rounded-full border-box border-[3px] border-solid border-[#595959be] bg-white  group-hover:border-[#3a3a3a84] transition delay-250 duration-[3000] ease-in active:border-[#ffffffd1]"
          />
          <IoSearchSharp 
            onClick={handleSearch}
            className="text-[1.9em] text-[#595959] opacity-70 absolute left-[24%] mt-[0.3%] group-hover:opacity-50 transition delay-250 duration-[3000] ease-in" />
        </div>

        <div className="ml-[60%]">
          <button
            onClick={openModal}
            className="w-[10vw] flex items-center text-[1.3em] p-2 rounded-xl shadow-xl text-[#595959] bg-[#cbc553ca] hover:text-white hover:bg-[#cbc553ca] transition-colors delay-250 duration-[3000] ease-in"
          >
            <IoMdAddCircleOutline className="text-[1.3em] ml-[8%]" />
            <p className="ml-[5%] font-semibold"> New Client </p>
          </button>
        </div>
      </div>

      {/* Client List */}
      <ClientListComponent clients={clients} userType={user_Type} />

      {/* New Client Modal */}
      {isModalOpen && <NewClient closeModal={closeModal} onNewRecordAdded={handleNewRecordAdded} />}
    </div>
  );
};

export default HomePage;
