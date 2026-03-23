import{j as r}from"./index-C1gvg0Oz.js";import{j as i}from"./vendor-icons-IPdlIlKX.js";const b={primary:"bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20",secondary:"bg-surface-card border border-surface-border hover:border-brand-500/50 text-white",danger:"bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400",ghost:"hover:bg-surface-muted text-slate-400 hover:text-white"},m={sm:"px-3 py-1.5 text-sm",md:"px-4 py-2 text-sm",lg:"px-6 py-3 text-base"};function x({children:t,variant:s="primary",size:a="md",loading:e=!1,disabled:o,className:d="",...n}){return r.jsxs("button",{disabled:o||e,className:`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-150 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${b[s]} ${m[a]} ${d}
      `,...n,children:[e&&r.jsx(i,{size:16,className:"animate-spin"}),t]})}export{x as B};
