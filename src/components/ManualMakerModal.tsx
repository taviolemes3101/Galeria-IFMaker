import React from 'react';
import { X, BookOpen, ShieldCheck, FileCode, CheckCircle2, Cpu, Wrench } from 'lucide-react';

interface ManualMakerModalProps {
  onClose: () => void;
}

export const ManualMakerModal: React.FC<ManualMakerModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-if-green text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">
                Manual Maker & Diretrizes de Submissão
              </h3>
              <p className="text-xs text-white/80">Laboratório IFMaker - IFSP Campus São Paulo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs leading-relaxed bg-slate-50">
          {/* Section 1 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-if-green font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <h4>1. O que é o Repositório Galeria IFMaker?</h4>
            </div>
            <p>
              A Galeria IFMaker é o catálogo acadêmico oficial de projetos desenvolvidos nos laboratórios de fabricação digital do IFSP Campus São Paulo. O objetivo é promover a cultura maker, a reprodutibilidade técnica, o compartilhamento de conhecimento aberto e a inovação tecnológica.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-if-green font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <h4>2. Fluxo do Ciclo de Vida do Projeto</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                <span className="font-bold text-slate-700">Rascunho (draft):</span>
                <p className="text-slate-500">Salvo pelo Maker para edição livre. Não visível ao público nem à moderação.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold text-amber-700">Pendente (pending):</span>
                <p className="text-amber-700">Enviado para análise dos avaliadores e docentes do IFMaker.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900">
                <span className="font-bold text-purple-700">Revisão (revision):</span>
                <p className="text-purple-700">Devolvido com parecer técnico de melhorias ou correção técnica necessárias.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="font-bold text-emerald-700">Publicado (published):</span>
                <p className="text-emerald-700">Aprovado e visível na vitrine pública oficial para toda a comunidade.</p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-if-green font-bold text-sm">
              <FileCode className="w-4 h-4" />
              <h4>3. Especificações e Formatos Aceitos</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                <strong className="text-slate-800">Modelagem 3D:</strong> .stl, .obj, .3mf, .f3d (Impressão 3D)
              </li>
              <li>
                <strong className="text-slate-800">Vetores e Corte a Laser:</strong> .dxf, .svg, .ai, .pdf
              </li>
              <li>
                <strong className="text-slate-800">Código-Fonte & Circuitos:</strong> .ino, .py, .cpp, .zip (Arduino / ESP32)
              </li>
              <li>
                <strong className="text-slate-800">Tamanho Máximo:</strong> Imagens de capa até 2MB; arquivos de anexo até 15MB.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Wrench className="w-4 h-4" />
              <h4>4. Normas do Laboratório & Propriedade Intelectual</h4>
            </div>
            <p className="text-slate-300 text-[11px]">
              Os conteúdos publicados devem respeitar os direitos autorais e licenças Creative Commons. É expressamente proibido submeter projetos que infrinjam diretrizes de segurança do IFSP ou contenham materiais impróprios.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-if-green text-white hover:bg-emerald-700 font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm uppercase tracking-wider"
          >
            Compreendido
          </button>
        </div>
      </div>
    </div>
  );
};
