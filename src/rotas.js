const express = require('express');

const { listarContasBancarias, saldo, extrato, atualizarDadosDoUsuario, criarContaBancaria, depositar, sacar, transferir, excluirContaBancaria, obterContaPeloNumero } = require('./controladores/bancodedados');

const rotas = express();

rotas.get('/contas', listarContasBancarias);
rotas.get('/contas/:numero_conta', obterContaPeloNumero);
rotas.post('/contas', criarContaBancaria);
rotas.delete('/contas/:numero_conta', excluirContaBancaria);
rotas.put('/contas/:numero_conta/usuario', atualizarDadosDoUsuario);
rotas.post('/transacoes/depositar', depositar);
rotas.post('/transacoes/sacar', sacar);
rotas.post('/transacoes/transferir', transferir);
rotas.get('/contas/saldo', saldo);
rotas.get('/contas/extrato', extrato);

module.exports = rotas;
