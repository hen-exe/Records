import axios from 'axios';
import React, { useState } from 'react';
import { IoMdPerson, IoIosCloseCircle } from 'react-icons/io';
import { IoNewspaperSharp } from "react-icons/io5";
import config from '../../common/config';

interface RecordDetailsProps {
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


interface DeleteRecordProps {
    closeModal: () => void;
    record?: RecordDetailsProps;
  }

const DeleteRecord: React.FC<DeleteRecordProps> = ({ record, closeModal }) => {
  const [errMess, setErrMess] = useState<string>('');
  const [errStatus, setErrStatus] = useState<string>('');

  const handleDelete = async () => {
    try {
      if (record) {
        const res = await axios.post(`${config.API}/records/deleteRecord?record_id=${record.record_id}`);
        setErrMess('');
        setErrStatus('true');
        console.log(res.data.message)
        closeModal();
      } else {
        setErrMess('Unsuccessful delete operation');
        setErrStatus('false');
      }
    } catch (err: any) {
        setErrMess(err.response?.data?.message || 'An error occurred');
    }
  };
  

  return (
    <>
        <div className="h-full w-full bg-[rgba(0,0,0,0.5)] backdrop-blur-sm fixed top-0 left-0 z-[100]">
          <div className="w-[45vw] h-[55vh] absolute left-[30%] top-[20%] bg-white rounded-xl shadow-xl justify-center animate-small-fade-in-down z-[200]">
           
            {/* Header */}
            <div className="w-full flex px-6 py-4 mt-[1%] font-jost text-[1.8em] border-b-4">
              <IoNewspaperSharp className="text-[#595959] mr-[2%] mt-[0.6%]" />
              <p className="text-[#595959] font-semibold"> Delete Record </p>
            </div>

            <div className='w-full text-[1.6em] text-center mt-[5%]'>
                <p>Are you sure you want to delete this record?</p>
            </div>

              <div className='flex mt-[13%]'>
                <div className="ml-[60%] mt-[15%]">
                    <button
                    onClick={closeModal}
                    className="w-[7vw] flex justify-center text-[1.3em] p-2 rounded-xl shadow-xl text-[#595959] bg-[#D9D9D9] hover:text-white hover:bg-[#bababa]  transition-colors delay-250 duration-[3000] ease-in"
                    >
                    <p className="ml-[5%]"> Cancel </p>
                    </button>
                </div>

                <div className="ml-[5%] mt-[15%]">
                    <button
                    onClick= {handleDelete}
                    className="w-[7vw] flex justify-center text-[1.3em] p-2 rounded-xl shadow-xl text-[#595959] bg-[#cb6f53b5] hover:text-white hover:bg-[#cb6f53d3]  transition-colors delay-250 duration-[3000] ease-in"
                    >
                    <p className="ml-[5%]"> Delete </p>
                    </button>
                </div>
              </div>
          </div>
        </div>
    </>
  );
};

export default DeleteRecord;
