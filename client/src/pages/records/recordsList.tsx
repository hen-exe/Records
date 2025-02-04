import React, { useEffect, useState, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../common/config.ts';
import { LuLogOut } from 'react-icons/lu';
import { IoSearchSharp } from 'react-icons/io5';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { IoArrowBackOutline } from 'react-icons/io5';
import RecordsCard from '../../components/card/recordsCard.tsx';
import NewRecord from './newRecord.tsx';

interface RecordsListProps {
  record_id: number;
  date: string;
  transaction: string;
  payments: number;
  expenses: number;
  total_amount: number;
  remarks: string;
  record_status: string;
  client_id: number;
}

const RecordsList: React.FC = () => {

    const location = useLocation();
    const { client_id, client_name, account_status } = location.state || { client_id: null, client_name: '', account_status: '' };
    const [records, setRecords] = useState<RecordsListProps[]>([]);
    const [isRecordCreatedSuccessfully, setIsRecordCreatedSuccessfully] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errMess, setErrMess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const Navigate = useNavigate();

    useEffect(() => {
      console.log("Retrieving records...")

      if (client_id !== null) {
        axios
          .get(`${config.API}/records/retrieveAll`, { params: { client_id } })
          .then((res) => {
            if(res.data.success == true) {
                setRecords(res.data.records);
              }else {
                console.log("couldnt retrieve records")
              }          
          })
          .catch((err) => {
            setRecords(err.response?.data?.message || 'An error occurred');
          });
      }
    }, [client_id]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNewRecordAdded = async () => {
    setIsRecordCreatedSuccessfully(true);
    try {
      const response = await axios.get(`${config.API}/records/retrieveCount`, {
        params: { client_id },
      });
      const transactionCounts = response.data.data;

      if (isRecordCreatedSuccessfully) {
        // Update the database with the new record data
        const res = await 
            axios.put(`${config.API}/user/updateClientSpecific`, {
              client_id: client_id,
              no_of_transactions: transactionCounts[client_id] || 0,
            })
      }

    } catch (error) {
      console.error('Error updating transaction counts:', error);
    }
  };

  useEffect(() => {
    if (isRecordCreatedSuccessfully) {
      handleNewRecordAdded();
      setIsRecordCreatedSuccessfully(false);
    }
  }, [isRecordCreatedSuccessfully]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
  
    if (trimmedQuery) {
      const words = trimmedQuery.split(' ');
  
      if (words.length === 1) {
        // User is searching first word of transaction
        axios
          .get(`${config.API}/records/retrieveByParams?col=transaction&val=${trimmedQuery}`)
          .then((res) => {
            setRecords(res.data.records);
          })
          .catch((err) => {
            setErrMess(err.response?.data?.message || 'An error occurred');
          });
      }
    } else {
      axios
        .get(`${config.API}/records/retrieveAll`, { params: { client_id } })
        .then((res) => {
          setRecords(res.data.records);
        })
        .catch((err) => {
          setErrMess(err.response?.data?.message || 'An error occurred');
        });
    }
  };

const handleLogout = () => {
  localStorage.removeItem('userType');
  
  Navigate('/');
}

    return (
        <div className ="h-full font-jost bg-[#D8DEDE] animate-fade-in">

            {/* Header */}
            <div className="w-full h-[10vh] flex bg-white rounded-xl shadow-xl items-center ">
                <div className="w-[20vw] p-4 text-[1.5em] text-[#595959] font-semibold hover:text-[#767a40]  transition-colors delay-250 duration-[3000] ease-in ">
                    <Link to="/homePage">
                        <button className="flex w-[100%] p-4">
                            <IoArrowBackOutline className="mt-[4%] text-[1.2em]" />
                            <p className='ml-[10%]'>Go Back</p> 
                        </button>
                    </Link>
                 </div>

                <div className="w-full ml-[13%] text-center text-[2.8em] text-[#595959] font-bold"> 
                    Records List
                 </div>

                 <div className="w-[20vw] ml-[10%] p-4 text-[1.5em] text-[#595959] font-semibold hover:text-[#767a40]  transition-colors delay-250 duration-[3000] ease-in ">
                        <button 
                          className="flex w-[100%] p-4"
                          onClick={handleLogout}>
                            <LuLogOut className="mt-[4%] text-[1.2em]" />
                            <p className='ml-[10%]'>Log Out</p> 
                        </button>
                 </div>
            </div>

            {/* Search & Add Record */}
            <div className="w-full flex mt-[3%] animate-small-fade-in-down">
                <div className="flex group ml-[1.5%] mr-[15%]">
                    <input
                        type='text'
                        placeholder="Search for a transaction..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-[25vw] h-[5vh] text-[1.3em] p-[0.2rem] pl-[1rem] rounded-full border-box border-[3px] border-solid border-[#595959be] bg-white  group-hover:border-[#3a3a3a84] transition delay-250 duration-[3000] ease-in active:border-[#ffffffd1]"
                    />
                    <IoSearchSharp className="text-[1.9em] text-[#595959] opacity-70 absolute left-[24%] mt-[0.3%] group-hover:opacity-50 transition delay-250 duration-[3000] ease-in" />
                </div>

                <div className='w-[20vw] h-auto text-center text-[1.9em] text-[#595959] font-semibold bg-[#ffffffc4] rounded-xl px-6'>
                    <p className='break-words text-wrap'>{client_name}</p>
                </div>

                <div className="flex-grow"></div>
                <div className="mr-[3%]">
                  {account_status === 'Active' && (
                      <button
                        onClick={openModal}
                        className='w-[10vw] flex items-center text-[1.3em] p-2 rounded-xl shadow-xl text-[#595959] bg-[#cbc553ca] hover:text-white hover:bg-[#cbc553ca]  transition-colors delay-250 duration-[3000] ease-in '
                    >
                        <IoMdAddCircleOutline className='text-[1.3em] ml-[8%]' /> 
                        <p className='ml-[5%] font-semibold'> New Record </p>
                    </button>) }
                </div>
            </div>

        {/* Records List */}
        <RecordsCard records = {records} accountStatus = {account_status}/>

        {/* New Record Modal */}
        {isModalOpen && <NewRecord closeModal={closeModal} client_id={client_id} onNewRecordAdded={handleNewRecordAdded} />}

        </div>
    )

}

export default RecordsList;