import{r as p,j as e,H as h,a as u}from"./app-0PReDAnm.js";import{A as b}from"./AuthenticatedLayout-Bws7iU08.js";import"./ApplicationLogo-hwrJs9rq.js";function j({auth:n,orders:x}){const[l,o]=p.useState(null),[i,g]=p.useState("In Process"),r=(t,s)=>{o(t),u.patch(route("staff.orders.update",{transaction:t}),{status:s},{onFinish:()=>o(null),preserveScroll:!0})},m=t=>{const s=window.open("","_blank");s.document.write(`
            <html>
                <head>
                    <title>SRDI Official Receipt - ${t.reference_no}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; line-height: 1.2; }
                        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                        .logo { width: 70px; height: 70px; margin-bottom: 5px; }
                        .institute-name { font-size: 14px; font-weight: bold; margin: 0; }
                        .address { font-size: 9px; margin: 2px 0; }
                        .receipt-title { font-size: 16px; font-weight: bold; margin-top: 10px; text-transform: uppercase; border: 1px solid #000; display: inline-block; padding: 2px 10px; }
                        .info { font-size: 11px; margin-bottom: 15px; width: 100%; }
                        .items-table { width: 100%; border-collapse: collapse; font-size: 11px; }
                        .items-table th { border-bottom: 1px solid #000; text-align: left; padding: 5px 0; }
                        .items-table td { padding: 5px 0; }
                        .total-section { margin-top: 15px; border-top: 2px dashed #000; padding-top: 10px; text-align: right; }
                        .footer { text-align: center; margin-top: 25px; font-size: 9px; }
                        @page { size: auto; margin: 0mm; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <img src="/img/srdi.png" class="logo" onerror="this.style.display='none'"/>
                        <p class="institute-name">SERICULTURE RESEARCH AND DEVELOPMENT INSTITUTE</p>
                        <p class="address">Sapilang, Bacnotan, La Union</p>
                        <div class="receipt-title">Official Receipt</div>
                    </div>

                    <table class="info">
                        <tr><td><strong>REF:</strong> ${t.reference_no}</td><td style="text-align:right"><strong>DATE:</strong> ${new Date().toLocaleDateString()}</td></tr>
                        <tr><td colspan="2"><strong>CUSTOMER:</strong> ${t.user?.first_name} ${t.user?.last_name}</td></tr>
                    </table>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${t.order_items.map(a=>`
                                <tr>
                                    <td>${a.product?.product}</td>
                                    <td style="text-align: center;">${a.quantity}</td>
                                    <td style="text-align: right;">₱${(a.quantity*a.price_at_sale).toLocaleString()}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <p style="font-size: 13px;"><strong>TOTAL PAID: ₱${Number(t.total_amount).toLocaleString()}</strong></p>
                    </div>

                    <div class="footer">
                        <p>Issued by: ${n.user.first_name} ${n.user.last_name}</p>
                        <p>Thank you for supporting SRDI!</p>
                    </div>

                    <script>
                        window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
                    <\/script>
                </body>
            </html>
        `),s.document.close()},d=x.data.filter(t=>i==="All"?!0:t.status===i);return e.jsxs(b,{header:"Order Management",children:[e.jsx(h,{title:"Order Management"}),e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-black text-slate-900 uppercase tracking-tighter",children:"Order Processing"}),e.jsx("p",{className:"text-xs text-slate-500 font-bold uppercase tracking-widest",children:"SRDI Facility Operations"})]}),e.jsx("div",{className:"flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto",children:["In Process","Ready to Pickup","Product Received","All"].map(t=>e.jsx("button",{onClick:()=>g(t),className:`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${i===t?"bg-indigo-600 text-white shadow-lg shadow-indigo-100":"text-slate-400 hover:text-slate-600"}`,children:t},t))})]}),e.jsxs("div",{className:"grid gap-4",children:[d.map(t=>e.jsxs("div",{className:"bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-6",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("span",{className:"text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md",children:t.reference_no}),e.jsxs("h3",{className:"text-lg font-black text-slate-800 uppercase mt-2",children:[t.user?.first_name," ",t.user?.last_name]}),e.jsx("p",{className:"text-[10px] text-slate-400 font-bold uppercase",children:new Date(t.created_at).toDateString()})]}),e.jsxs("div",{className:"flex-[1.5] border-l border-slate-100 pl-6",children:[e.jsx("p",{className:"text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2",children:"Order Items"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:t.order_items.map((s,c)=>e.jsxs("span",{className:"text-[10px] font-bold bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-600",children:[s.product?.product," (x",s.quantity,")"]},c))})]}),e.jsxs("div",{className:"text-right px-8 border-l border-slate-100",children:[e.jsx("p",{className:"text-[9px] font-black text-slate-400 uppercase",children:"Total Paid"}),e.jsxs("p",{className:"text-xl font-black text-indigo-600",children:["₱",Number(t.total_amount).toLocaleString()]})]}),e.jsxs("div",{className:"flex gap-2 w-full lg:w-auto",children:[t.status==="In Process"&&e.jsx("button",{onClick:()=>r(t.id,"Ready to Pickup"),disabled:l===t.id,className:"flex-1 lg:flex-none px-6 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100",children:l===t.id?"Updating...":"Set to Ready"}),t.status==="Ready to Pickup"&&e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>m(t),className:"px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-black transition-all",children:"Print Receipt"}),e.jsx("button",{onClick:()=>r(t.id,"Product Received"),disabled:l===t.id,className:"px-6 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100",children:"Release Product"})]}),t.status==="Product Received"&&e.jsx("div",{className:"px-6 py-3 bg-slate-100 text-slate-400 text-[10px] font-black rounded-2xl uppercase border border-slate-200",children:"Released"})]})]},t.id)),d.length===0&&e.jsx("div",{className:"bg-white rounded-[3rem] py-20 text-center border-2 border-dashed border-slate-200",children:e.jsx("p",{className:"text-slate-400 font-black uppercase tracking-[0.2em] text-xs",children:"No orders found in this section"})})]})]})}export{j as default};
