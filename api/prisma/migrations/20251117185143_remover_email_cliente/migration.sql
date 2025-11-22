-- DropForeignKey
ALTER TABLE `MensalidadePagamento` DROP FOREIGN KEY `MensalidadePagamento_estabelecimentoId_fkey`;

-- AlterTable
ALTER TABLE `Estabelecimento` MODIFY `mensagem_voucher` TEXT NULL;

-- AddForeignKey
ALTER TABLE `MensalidadePagamento` ADD CONSTRAINT `MensalidadePagamento_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `Estabelecimento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `CartaoFidelidade` RENAME INDEX `cartao_cliente_estabelecimento_unique` TO `CartaoFidelidade_clienteId_estabelecimentoId_key`;
