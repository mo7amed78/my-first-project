const express = require('express');
const router = express.Router();
const {Scan} = require('../models/Scan');
const {Lecture} = require('../models/Lecture');
const {egyptTime} = require('../utils/timeEdit');
const exceljs = require('exceljs');
const asyncHandler = require('express-async-handler');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');


/**
 * @desc get all student scans by lectureId and export to excel
 * @route /api/export/excel/:lectureId
 * @method GET
 * @access private
 */

router.get('/excel/:lectureId',verifyToken,isAdmin,asyncHandler( async(req,res)=>{
    const lectureId = req.params.lectureId;

    const lecture = await Lecture.findById(lectureId);

    if(!lecture) return;
    
    const dataRecords = await Scan.find({lectureId:lectureId}).populate("userId","firstName lastName email")
                                                              .populate("lectureId","lectureName date stage")

    if(dataRecords.length === 0 ){
       return res.json({message:"لا يوجد بيانات حالياً"});
    }

        const data = dataRecords.map( item=> ({
        ...item._doc,
        timeEdit:egyptTime(item.scannedAt),

        }));


    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet(`${data[0].lectureId.stage}`);

    worksheet.columns=[
        {header:"Student Name",key:"name",width:30},
        {header:"Time",key:"time",width:20},
        {header:"Email",key:"email",width:30}
    ];

    data.forEach(d=>{ worksheet.addRow({name:`${d.userId.firstName} ${d.userId.lastName}` , time:d.timeEdit.split(", ")[1] , email:d.userId.email }) });

    worksheet.getRow(1).eachCell((cell)=>{
            cell.font = {
                bold: true,
                size: 12,
                color: { argb: 'FFFFFFFF' } 
            };

            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' } 
            };

            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };    
    });

        worksheet.getRow(1).height = 30;


        worksheet.eachRow((row,rowIndex)=>{
            if(rowIndex>1){
                row.height=25;
                row.alignment = {
                vertical: 'middle',
            };    

            }

            if(rowIndex>1 && rowIndex%2 !== 0){
                
                row.eachCell((cell)=>{

                cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFBDD7EE' } 

                };


                })

               
            }
        });

        worksheet.getColumn("time").eachCell((cell)=>{
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };    

        });



         res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + `${data[0].lectureId.lectureName}_${data[0].timeEdit.split(", ")[0].replaceAll("/","-")}.xlsx`
        );

        
            await workbook.xlsx.write(res);
            res.end(); 

}));




module.exports = router;
