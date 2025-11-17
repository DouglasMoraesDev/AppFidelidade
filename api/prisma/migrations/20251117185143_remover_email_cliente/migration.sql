-- DropForeignKey
ALTER TABLE `mensalidadepagamento` DROP FOREIGN KEY `MensalidadePagamento_estabelecimentoId_fkey`;

-- AlterTable
ALTER TABLE `estabelecimento` MODIFY `mensagem_voucher` TEXT NULL;

-- AddForeignKey
ALTER TABLE `MensalidadePagamento` ADD CONSTRAINT `MensalidadePagamento_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `Estabelecimento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `cartaofidelidade` RENAME INDEX `cartao_cliente_estabelecimento_unique` TO `CartaoFidelidade_clienteId_estabelecimentoId_key`;
