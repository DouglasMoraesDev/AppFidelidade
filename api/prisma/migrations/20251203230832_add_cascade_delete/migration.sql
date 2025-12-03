-- DropForeignKey
ALTER TABLE `CartaoFidelidade` DROP FOREIGN KEY `CartaoFidelidade_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `CartaoFidelidade` DROP FOREIGN KEY `CartaoFidelidade_estabelecimentoId_fkey`;

-- DropForeignKey
ALTER TABLE `MensalidadePagamento` DROP FOREIGN KEY `MensalidadePagamento_estabelecimentoId_fkey`;

-- DropForeignKey
ALTER TABLE `Movimento` DROP FOREIGN KEY `Movimento_cartaoId_fkey`;

-- DropForeignKey
ALTER TABLE `Usuario` DROP FOREIGN KEY `Usuario_estabelecimentoId_fkey`;

-- DropForeignKey
ALTER TABLE `Voucher` DROP FOREIGN KEY `Voucher_cartaoId_fkey`;

-- DropForeignKey
ALTER TABLE `Voucher` DROP FOREIGN KEY `Voucher_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `Voucher` DROP FOREIGN KEY `Voucher_estabelecimentoId_fkey`;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `Estabelecimento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartaoFidelidade` ADD CONSTRAINT `CartaoFidelidade_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartaoFidelidade` ADD CONSTRAINT `CartaoFidelidade_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `Estabelecimento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Movimento` ADD CONSTRAINT `Movimento_cartaoId_fkey` FOREIGN KEY (`cartaoId`) REFERENCES `CartaoFidelidade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Voucher` ADD CONSTRAINT `Voucher_cartaoId_fkey` FOREIGN KEY (`cartaoId`) REFERENCES `CartaoFidelidade`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Voucher` ADD CONSTRAINT `Voucher_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Voucher` ADD CONSTRAINT `Voucher_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `Estabelecimento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MensalidadePagamento` ADD CONSTRAINT `MensalidadePagamento_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `Estabelecimento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
