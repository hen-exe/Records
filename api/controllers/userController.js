const express = require('express');
const db = require('./db.js'); 


const createClient = (req, res) => {
    const { client_name, contact_number } = req.body;

    const transac = 0;
    const status = 'Active';

    // Check if client with the same name already exists
    const checkClientExistenceSql = "SELECT * FROM client WHERE client_name = ?";
    
    db.query(checkClientExistenceSql, [client_name], (checkErr, checkResults) => {
        if (checkErr) {
            res.status(500).json({
                success: false,
                message: "Error checking client existence",
            });
        } else if (checkResults.length > 0) {
            res.status(400).json({
                success: false,
                message: "Client with the same name already exists",
            });
        } else {
            const insertClientSql = "INSERT INTO client (client_name, contact_number, no_of_transactions, account_status) VALUES (?, ?, ?, ?)";
            const values = [client_name, contact_number, transac, status];

            db.query(insertClientSql, values, (err, results) => {
                if (err) {
                    res.status(404).json({
                        success: false,
                        message: "Client add failed",
                    });
                } else {
                    res.status(200).json({
                        success: true,
                        message: "Client created successfully",
                        data: results,
                    });
                }
            });
        }
    });
};

const updateClient = (req, res) => {
    const { client_id, client_name, contact_number } = req.body;

    const sql = "UPDATE client SET client_name = ?, contact_number = ? WHERE client_id = ?";

    db.query(sql, [client_name, contact_number, client_id], (err, results) => {
        if (err) {
            console.error('Error updating client:', err);
            res.status(500).json({
                success: false,
                message: "Failed to update client",
                error: err.message
            });
        } else if (results.affectedRows === 0) {
            res.status(404).json({
                success: false,
                message: "Client not found",
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Client updated successfully",
                data: results
            });
        }
    });
};


const updateClientSpecific = (req, res) => {
    const { client_id, no_of_transactions} = req.body;

    const sql = `UPDATE client SET no_of_transactions = ? WHERE client_id = ?`;

    db.query(sql, [no_of_transactions, client_id], (err, results) => {
        if (err) {
            console.error('Error updating client:', err);
            res.status(500).json({
                success: false,
                message: "Failed to update client",
                error: err.message
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Client updated successfully",
                data: results
            });
        }
    });
};

const retrieveAll = (req, res) => {
    try {
        const sql = "SELECT * FROM client"
        db.query(sql, (err, results) => {
            if(err){
                res.status(500).json({error: 'Internal server error'})
            }else{
                res.json({
                    success: true,
                    client: results,
                })
            }
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Database Error",
        });
    }
}

const retrieveClientDetails = (req, res) => { //retrieve specific client
    try {
        const { client_id } = req.query;

        const sql = "SELECT * FROM client WHERE client_id = ?";

        console.log(">>>", sql, req)
        
        db.query(sql, [client_id], (err, results) => {
            if (err) {
                res.status(500).json({ error: "Internal server error" });
            } else {
                res.json({
                    success: true,
                    client: results,
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Database Error",
        });
    }
};

const retrieveByParams = (req, res) => { //for search
    try {
      const { col, val } = req.query;
  
      let sql;
      let values;
  
      if (col === 'client_name') {
        sql = "SELECT * FROM client WHERE ?? LIKE ?";
        values = [col, `%${val}%`];
      } else {
        // Invalid column
        return res.status(400).json({ error: 'Invalid column specified' });
      }
  
      db.query(sql, values, (err, results) => {
        if (err) {
          res.status(500).json({ error: 'Internal server error' });
        } else {
          res.json({
            status: 200,
            success: true,
            users: results,
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        success: false,
        message: 'Database Error',
      });
    }
  };
  

const deleteClient = (req, res) => { //soft-delete only
    try {
        const { client_id } = req.query;
        const sql = "UPDATE client SET account_status = 'Deleted' WHERE client_id = ? "

        db.query(sql,[client_id], (err, results) => {
            if (err) {
                console.error('Error Getting data:', err)
                res.status(500).json({
                    status: 500,
                    success: false,
                    message: "Unsuccesful delete operation",
                    error: err.message
                })
            } else if (results.affectedRows === 0) {
                res.status(404).json({
                    status: 404,
                    success: false,
                    message: "Client not found",
                });
            }
            else {
                res.status(200).json({
                    status: 200,
                    success: true,
                    message: "Successfully deleted client",
                    data: results
                })
            }
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Database Error",
            error: error.message
        });
    }
}

module.exports = {
    createClient,
    updateClient,
    updateClientSpecific,
    retrieveAll,
    retrieveClientDetails,
    retrieveByParams,
    deleteClient
};