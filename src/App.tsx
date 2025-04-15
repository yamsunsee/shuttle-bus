import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Item = {
  index: string;
  id: string;
  name: string;
  morningStations: { [key: string]: boolean };
  eveningStations: { [key: string]: boolean };
};

const normalizeVietnamese = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const stationNames = {
  station1: "Điện Biên Phủ",
  station2: "Ngã tư Bình Phước",
  station3: "AEON Bình Dương",
  station4: "Chợ Hàng Bông",
  station5: "Ngã tư Thủ Đức",
  station6: "Vincom Dĩ An",
};

function App() {
  const [data, setData] = useState<Item[]>([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [stationFilters, setStationFilters] = useState<string[]>(["all"]);
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    fetch(
      "https://docs.google.com/spreadsheets/d/1nVdESerxIJt2wGWOOVJtHrU_0-ytdI57ZJhRLtzMMAk/export?format=csv&id=1nVdESerxIJt2wGWOOVJtHrU_0-ytdI57ZJhRLtzMMAk&gid=175980079"
    )
      .then((response) => response.text())
      .then((csv) => {
        const rows = csv.split("\n");
        const dataRows = rows.slice(4, -1);
        const parsedData = dataRows.map((row) => {
          const decoder = new TextDecoder("utf-8");
          const decodedRow = decoder.decode(new TextEncoder().encode(row));
          const values = decodedRow.split(",");

          return {
            index: values[0],
            id: values[1],
            name: values[2].toUpperCase(),
            morningStations: {
              station1: values[3] === "1",
              station2: values[4] === "1",
              station3: values[5] === "1",
              station4: values[6] === "1",
              station5: values[7] === "1",
              station6: values[8] === "1",
            },
            eveningStations: {
              station1: values[9] === "1",
              station2: values[10] === "1",
              station3: values[11] === "1",
              station4: values[12] === "1",
              station5: values[13] === "1",
              station6: values[14] === "1",
            },
          };
        });

        setData(parsedData);
      });
  }, []);

  const filteredData = data.filter((item) => {
    const matchesTime =
      timeFilter === "all" ||
      (timeFilter === "morning" && Object.values(item.morningStations).some((v) => v)) ||
      (timeFilter === "evening" && Object.values(item.eveningStations).some((v) => v));

    const matchesStation =
      stationFilters.includes("all") ||
      stationFilters.some((station) => item.morningStations[station] || item.eveningStations[station]);

    const matchesName = nameFilter === "" || normalizeVietnamese(item.name).includes(normalizeVietnamese(nameFilter));

    return matchesTime && matchesStation && matchesName;
  });

  const handleStationChange = (value: string) => {
    if (value === "all") {
      setStationFilters(["all"]);
    } else {
      const newFilters = stationFilters.filter((f) => f !== "all");
      if (newFilters.includes(value)) {
        setStationFilters(newFilters.filter((f) => f !== value));
      } else {
        setStationFilters([...newFilters, value]);
      }
    }
  };

  const showBothColumns = timeFilter === "all" && stationFilters.includes("all");

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-screen">
      <div className="flex flex-col gap-4 items-center">
        <Input placeholder="Tìm kiếm theo tên..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ca</SelectItem>
            <SelectItem value="morning">Lên ca</SelectItem>
            <SelectItem value="evening">Xuống ca</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handleStationChange("all")}
            className={`px-3 py-1 rounded ${stationFilters.includes("all") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Tất cả trạm
          </button>
          {Object.entries(stationNames).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleStationChange(key)}
              className={`px-3 py-1 rounded ${stationFilters.includes(key) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500">Tìm thấy {filteredData.length} kết quả</div>
      </div>
      <div className="rounded-md overflow-hidden border">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Tên</TableHead>
              {showBothColumns && (
                <>
                  <TableHead>Trạm lên ca</TableHead>
                  <TableHead>Trạm xuống ca</TableHead>
                </>
              )}
              {!showBothColumns && timeFilter === "morning" && <TableHead>Trạm lên ca</TableHead>}
              {!showBothColumns && timeFilter === "evening" && <TableHead>Trạm xuống ca</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                {showBothColumns && (
                  <>
                    <TableCell>
                      {Object.entries(item.morningStations).map(
                        ([station, value]) =>
                          value && (
                            <span key={station} className="mr-2">
                              {stationNames[station as keyof typeof stationNames]}
                            </span>
                          )
                      )}
                    </TableCell>
                    <TableCell>
                      {Object.entries(item.eveningStations).map(
                        ([station, value]) =>
                          value && (
                            <span key={station} className="mr-2">
                              {stationNames[station as keyof typeof stationNames]}
                            </span>
                          )
                      )}
                    </TableCell>
                  </>
                )}
                {!showBothColumns && timeFilter === "morning" && (
                  <TableCell>
                    {Object.entries(item.morningStations).map(
                      ([station, value]) =>
                        value && (
                          <span key={station} className="mr-2">
                            {stationNames[station as keyof typeof stationNames]}
                          </span>
                        )
                    )}
                  </TableCell>
                )}
                {!showBothColumns && timeFilter === "evening" && (
                  <TableCell>
                    {Object.entries(item.eveningStations).map(
                      ([station, value]) =>
                        value && (
                          <span key={station} className="mr-2">
                            {stationNames[station as keyof typeof stationNames]}
                          </span>
                        )
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default App;
