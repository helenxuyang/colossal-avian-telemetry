import { CSVLink } from "react-csv";
import type { ParsedData } from "./dataUtils";
import { ALL_ESCS } from "./data";
import { useState } from "react";

type CSVRow = (string | number)[];

export class CSVWriterSingleton {
    rawData: ParsedData[];
    firstTimestamp: number = 0;

    private static instance: CSVWriterSingleton;

    private constructor() {
        this.rawData = [];
    }

    public static getInstance(): CSVWriterSingleton {
        if (!CSVWriterSingleton.instance) {
            CSVWriterSingleton.instance = new CSVWriterSingleton();
        }
        return CSVWriterSingleton.instance;
    }

    public addData(data: ParsedData) {
        if (this.rawData.length === 0) {
            this.firstTimestamp = Date.now();
        }
        this.rawData.push(data);
    }

    public getRawData() {
        return this.rawData;
    }

    public getFormattedData(): CSVRow[] {
        const dataRows = this.rawData.filter(rawData => rawData.escData.dataType === 'data')
            .map(({ escName, timestamp, escData }) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { dataType, ...values } = escData;
                return { escName, timestamp, ...values };

            });
        const dataHeaders = Object.keys(dataRows.length ? dataRows[0] : []);

        const inputDataRows = this.rawData.filter(rawData => rawData.escData.dataType === 'input')
            .map(({ escName, timestamp, escData }) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { dataType, ...values } = escData;
                return { escName, timestamp, ...values }
            });

        const inputHeaders = Object.keys(inputDataRows.length ? inputDataRows[0] : []);

        const formattedData: CSVRow[] = [];

        ALL_ESCS.forEach(esc => {
            formattedData.push(dataHeaders);
            dataRows.filter(data => data.escName === esc).forEach(data => {
                formattedData.push(Object.values(data));
            });
            formattedData.push(inputHeaders);
            inputDataRows.filter(data => data.escName === esc).forEach(data => {
                formattedData.push(Object.values(data));
            });
        });

        return formattedData;
    }

    public getFormattedFirstTimestamp(): string {
        const date = new Date(this.firstTimestamp);
        return date.toISOString();
    }
}

export const CSVDownloader = () => {
    const [fileName, setFileName] = useState<string>("");
    const [formattedData, setFormattedData] = useState<CSVRow[]>([]);

    const prepareDownload = () => {
        const csvWriter = CSVWriterSingleton.getInstance();
        setFormattedData(csvWriter.getFormattedData());
        setFileName(`colossal-avian-${csvWriter.getFormattedFirstTimestamp()}.csv`);
    }

    return <CSVLink onClick={() => { prepareDownload() }} data={formattedData} filename={fileName} >Download CSV</CSVLink>
}