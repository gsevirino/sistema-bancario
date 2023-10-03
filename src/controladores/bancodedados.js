const bancodedados = require('../dados/bancodedados');
const { contas } = require('../dados/bancodedados');

let numeroProximaContaCriada = 1;

const listarContasBancarias = (req, res) => {
    return res.json(contas);
};

const obterContaPeloNumero = (req, res) => {
    const numeroRequisitado = Number(req.params.numero_conta);

    if (isNaN(numeroRequisitado)) {
        return res.status(400).json({ mensagem: 'O numero informado não é um número válido' });
    }

    const contaLocalizada = bancodedados.contas.find((contas) => {
        return contas.numero_conta === numeroRequisitado
    });

    if (!contaLocalizada) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontada!' });
    }

    return res.json(contaLocalizada);
};

const criarContaBancaria = (req, res) => {
    const { usuario: { nome, cpf, data_nascimento, telefone, email, senha }
    } = req.body;

    let saldo = 0;

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome deverá ser informado' });
    }
    if (!cpf) {
        return res.status(400).json({ mensagem: 'O cpf deverá ser informado' });
    }
    if (!data_nascimento) {
        return res.status(400).json({ mensagem: 'A data de nascimento deverá ser informada' });
    }
    if (!telefone) {
        return res.status(400).json({ mensagem: 'O número de telefone deverá ser informado' });
    }
    if (!email) {
        return res.status(400).json({ mensagem: 'O email deverá ser informado' });
    }
    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha deverá ser informada' });
    }

    const contaExistente = bancodedados.contas.find((conta) => conta.usuario.email === email || conta.usuario.cpf === cpf);

    if (contaExistente) {
        return res.status(400).json({ mensagem: 'Já existe uma conta com o cpf ou e-mail informado!' });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha deverá ser informada' });
    }

    const novaConta = {
        numero_conta: numeroProximaContaCriada,
        saldo,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    contas.push(novaConta);

    numeroProximaContaCriada++;

    return res.status(201).send();

};

const excluirContaBancaria = (req, res) => {
    const numeroRequisitado = Number(req.params.numero_conta);

    if (isNaN(numeroRequisitado)) {
        return res.status(400).json({ mensagem: 'O numero informado não é um número válido' });
    }

    const indiceContaExclusao = bancodedados.contas.findIndex((usuario) => {
        return usuario.numero_conta === numeroRequisitado
    });

    if (indiceContaExclusao < 0) {
        return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    const contaExcluida = bancodedados.contas[indiceContaExclusao];

    if (contaExcluida.saldo !== 0) {
        return res.status(400).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' });
    }

    bancodedados.contas.splice(indiceContaExclusao, 1);

    res.status(204).send();

};

const atualizarDadosDoUsuario = (req, res) => {
    const numeroRequisitado = Number(req.params.numero_conta);

    const { usuario: { nome, cpf, data_nascimento, telefone, email, senha } } = req.body;

    if (isNaN(numeroRequisitado)) {
        return res.status(400).json({ mensagem: 'O número informado não é um número válido' });
    }

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome deverá ser informado' });
    }
    if (!cpf) {
        return res.status(400).json({ mensagem: 'O cpf deverá ser informado' });
    }
    if (!data_nascimento) {
        return res.status(400).json({ mensagem: 'A data de nascimento deverá ser informada' });
    }
    if (!telefone) {
        return res.status(400).json({ mensagem: 'O número de telefone deverá ser informado' });
    }
    if (!email) {
        return res.status(400).json({ mensagem: 'O email deverá ser informado' });
    }
    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha deverá ser informada' });
    }

    const indiceContaAtualizacao = bancodedados.contas.findIndex((conta) => {
        return conta.numero_conta === numeroRequisitado;
    });

    if (indiceContaAtualizacao < 0) {
        return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    const contaAtualizada = bancodedados.contas[indiceContaAtualizacao];
    contaAtualizada.usuario.nome = nome;
    contaAtualizada.usuario.cpf = cpf;
    contaAtualizada.usuario.data_nascimento = data_nascimento;
    contaAtualizada.usuario.telefone = telefone;
    contaAtualizada.usuario.email = email;
    contaAtualizada.usuario.senha = senha;

    return res.status(200).json({ mensagem: 'Dados do usuário atualizados com sucesso' });
}

const saldo = (req, res) => {
    const numeroRequisitado = Number(req.params.numero_conta);

    const contaLocalizada = bancodedados.contas.find((conta) => {
        return conta.numero_conta === numeroRequisitado;
    });

    if (!contaLocalizada) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontrada' });
    }

    return res.json({ saldo: contaLocalizada.saldo });
};

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body;

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: 'O número da conta e o valor são obrigatórios!' });
    }

    const contaEncontrada = bancodedados.contas.find(conta => conta.numero_conta === numero_conta);

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'Não é possível utilizar valores menores ou iguais a zero.' });
    }

    contaEncontrada.saldo += valor;

    const dataHoraAtual = new Date().toISOString();

    const transacao = {
        data: dataHoraAtual,
        numero_conta: numero_conta,
        valor: valor
    };

    bancodedados.depositos.push(transacao);
    res.status(204).end();
};

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta, o valor do saque e a senha são obrigatórios!' });
    }

    const contaEncontrada = bancodedados.contas.find(conta => conta.numero_conta === numero_conta);

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    if (senha !== contaEncontrada.usuario.senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta.' });
    };

    if (valor <= 0 || contaEncontrada.saldo <= 0) {
        return res.status(400).json({ mensagem: 'Valor de saque inválido ou saldo insuficiente!' });
    }

    contaEncontrada.saldo -= valor;

    const dataHoraAtual = new Date().toISOString();

    const transacao = {
        data: dataHoraAtual,
        numero_conta: numero_conta,
        valor: valor
    };

    bancodedados.saques.push(transacao);
    res.status(204).end();
};

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: 'Número da conta de origem, número da conta de destino, valor e senha são obrigatórios!' });
    };

    const contaOrigem = bancodedados.contas.find(conta => conta.numero_conta === Number(numero_conta_origem));
    const contaDestino = bancodedados.contas.find(conta => conta.numero_conta === Number(numero_conta_destino));

    if (!contaOrigem || !contaDestino) {
        return res.status(400).json({ mensagem: 'Conta bancária de origem ou conta bancária de destino não existem!' });
    }

    if (senha !== contaOrigem.usuario.senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta.' });
    };

    if (valor <= 0 || contaOrigem.saldo <= 0) {
        return res.status(400).json({ mensagem: 'Valor de saque inválido ou saldo insuficiente!' });
    }

    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    const dataHoraAtual = new Date().toISOString();

    const transacao = {
        data: dataHoraAtual,
        numero_conta_origem: numero_conta_origem,
        numero_conta_destino: numero_conta_destino,
        valor: valor
    };

    bancodedados.transferencias.push(transacao);
    res.status(204).end();
};

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    const contaEncontrada = bancodedados.contas.find(conta => conta.numero_conta === Number(numero_conta));

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }
    if (contaEncontrada.usuario.senha !== String(senha)) {
        return res.status(403).json({ mensagem: "Senha incorreta." });
    }

    const depositosRealizados = bancodedados.depositos.filter((deposito) => {
        return deposito.numero_conta === Number(numero_conta);
    });

    const saquesRealizados = bancodedados.saques.filter((saque) => {
        return saque.numero_conta === Number(numero_conta);
    });

    const TransferenciasEnviadas = bancodedados.transferencias.filter((transferencia) => {
        return transferencia.numero_conta_origem === Number(numero_conta);
    });

    const transferenciasRecebidas = bancodedados.transferencias.filter((transferencia) => {
        return transferencia.numero_conta_origem !== Number(numero_conta);
    });

    return res.status(200).json({
        depositos: depositosRealizados, saques: saquesRealizados, transferenciasEnviadas: TransferenciasEnviadas,
        transferenciasRecebidas: transferenciasRecebidas
    });
};

module.exports = {
    listarContasBancarias,
    obterContaPeloNumero,
    criarContaBancaria,
    excluirContaBancaria,
    atualizarDadosDoUsuario,
    saldo,
    extrato,
    depositar,
    sacar,
    transferir
}