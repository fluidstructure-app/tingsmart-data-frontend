import { paragon } from "@useparagon/connect";
import { useState, useEffect } from "react";
import {
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    TextField,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Grid,
    IconButton,
} from "@mui/material"; // Using Material-UI for styling
import {
    Lock as LockIcon,
    Link as LinkIcon,
    PlayArrow as PlayArrowIcon,
    Tune as TuneIcon,
} from "@mui/icons-material"; // Icons for buttons

export default function ParagonConnect() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [workflowResponse, setWorkflowResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [columns, setColumns] = useState([]); // All available columns
    const [visibleColumns, setVisibleColumns] = useState([]); // Columns to display
    const [filters, setFilters] = useState([]); // Filters for each column
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // Sorting configuration
    const [uniqueColumnValues, setUniqueColumnValues] = useState({}); // Unique values for each column

    // Extract columns and unique values from workflowResponse
    useEffect(() => {
        if (workflowResponse) {
            const keys = Object.keys(workflowResponse[0]);
            setColumns(keys);
            setVisibleColumns(keys); // Show all columns by default

            // Extract unique values for each column
            const uniqueValues = {};
            keys.forEach((key) => {
                const values = workflowResponse.map((row) => row[key]);
                uniqueValues[key] = [...new Set(values)]; // Remove duplicates
            });
            setUniqueColumnValues(uniqueValues);
        }
    }, [workflowResponse]);

    // Show snackbar for success/error messages
    const showSnackbar = (message, severity = "success") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Step 1: Authenticate the user with Paragon
    async function authenticateParagon() {
        setLoading(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/get-paragon-user-token/?email=test@example.com");
            const data = await response.json();

            if (!data.token) {
                showSnackbar("Authentication failed.", "error");
                return;
            }

            await paragon.authenticate(
                '7dfb0cd4-7ab7-4441-bebc-db2035bf97f3',
                'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSIsImlhdCI6MTczODY2NTc5NSwiZXhwIjoxNzM4NzUyMTk1fQ.L7rlLWMBSCELHo3PC-r_vtodehKIa5O3w1PkqHU5fFcl3Sa7yuD8UtU6EARdGgUIoOReCEANgHo_WgZQGNSK2k8hH10gzJ7CqOYxP6mgo5LllxuPsNEH74H763oUADvd6OqkaKMkfV_51AtAxewfKyETb3K1HCTVGqY7pdJqlJZCLM4QCj0o8ID0g_FPKW7jPDJkuLqIs6zA8q5gr_SVWuE8lgO1qTRZtX1gMkpzEQqEIj-XF7bTn3AV6cGAzHmxXkDo3w43g29QOj5hyoY_HYWmnvvCzdedSIyMaDYJBk4aL9YP3l4MtvpARpCpDmhtvzPIg1vx4qku-npRd1CvCTzP9PJmFoxBx7PW2fg7Ow5TjCnKFRCztYUAsXGHoeuvYi0ydbYNsLL4Y2A4Y5LtCL5k6EPYukuPKbELhWk6ynZiBB_muZdD4PqpX_lbCwo9OS4Rfl8rmBlNPc-vnjewLPicNN2UzDsrYxTrajjhLjCG32eqql9OlhH6qrB5153WNr-1vrxT_lVnlvFOo16iYhYE-WQRQCYlqEWCaicUF_jECwFfGATnhWwIS4GDUXdqe9vdwVPsxoBKgDv5Lj23jcnXi9agJT9dPSiDyv4pfxwJeMx9SKRikl9amJB9CQqlZHyCofXYih74vA0NeuZ5cB5FuDW9eTwRAKgVfOsPFkc'
            );
            setIsAuthenticated(true);
            showSnackbar("Authentication successful!");
        } catch (err) {
            console.error("Authentication Error:", err);
            setError("Failed to authenticate with Paragon.");
            showSnackbar("Authentication failed.", "error");
        } finally {
            setLoading(false);
        }
    }

    // Step 2: Connect to Google Sheets
    function connectGoogleSheets() {
        if (isAuthenticated) {
            paragon.connect("googlesheets");
            showSnackbar("Google Sheets connected!");
        } else {
            showSnackbar("Please authenticate first!", "error");
        }
    }

    // Step 3: Execute Paragon Workflow
    async function executeWorkflow() {
        if (!isAuthenticated) {
            showSnackbar("Please authenticate first!", "error");
            return;
        }

        setLoading(true);
        try {
            const response = await paragon.workflow("4f3aeecf-9e01-4088-8630-5a4c11747abd", {
                key1: "value1",
                key2: "value2"
            });

            setWorkflowResponse(response['data']);
            setError(null);
            showSnackbar("Workflow executed successfully!");
        } catch (err) {
            console.error("Workflow Execution Error:", err);
            setError("Failed to execute the workflow.");
            showSnackbar("Workflow execution failed.", "error");
        } finally {
            setLoading(false);
        }
    }

    // Handle column visibility change
    const handleColumnVisibilityChange = (column) => {
        if (visibleColumns.includes(column)) {
            setVisibleColumns(visibleColumns.filter((col) => col !== column));
        } else {
            setVisibleColumns([...visibleColumns, column]);
        }
    };

    // Add a new filter
    const addFilter = () => {
        setFilters([...filters, { column: "", condition: "", value: "" }]);
    };

    // Update a filter
    const updateFilter = (index, field, value) => {
        const updatedFilters = [...filters];
        updatedFilters[index][field] = value;
        setFilters(updatedFilters);
    };

    // Remove a filter
    const removeFilter = (index) => {
        const updatedFilters = filters.filter((_, i) => i !== index);
        setFilters(updatedFilters);
    };

    // Handle sorting
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // Apply filters and sorting to data
    const getFilteredAndSortedData = () => {
        let data = workflowResponse || [];

        // Apply filters
        if (filters.length > 0) {
            data = data.filter((row) =>
                filters.every((filter) => {
                    if (!filter.column || !filter.condition) return true;
                    const columnValue = row[filter.column];
                    switch (filter.condition) {
                        case "equals":
                            return columnValue == filter.value;
                        case "contains":
                            return String(columnValue).includes(filter.value);
                        case "greaterThan":
                            return columnValue > filter.value;
                        case "lessThan":
                            return columnValue < filter.value;
                        default:
                            return true;
                    }
                })
            );
        }

        // Apply sorting
        if (sortConfig.key) {
            data.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }

        return data;
    };

    return (
        <Paper elevation={3} style={{ padding: "20px", maxWidth: "1200px", margin: "auto", marginTop: "50px" }}>
            <Typography variant="h4" align="center" gutterBottom>
                Paragon Integration
            </Typography>

            <Grid container spacing={2} justifyContent="center" style={{ marginBottom: "20px" }}>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<LockIcon />}
                        onClick={authenticateParagon}
                        disabled={loading || isAuthenticated}
                    >
                        {loading ? <CircularProgress size={24} /> : "Authenticate"}
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<LinkIcon />}
                        onClick={connectGoogleSheets}
                        disabled={!isAuthenticated || loading}
                    >
                        Connect Sheets
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<PlayArrowIcon />}
                        onClick={executeWorkflow}
                        disabled={!isAuthenticated || loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Run Workflow"}
                    </Button>
                </Grid>
                <Grid item>
                    <IconButton
                        color="primary"
                        onClick={() => setConfigDialogOpen(true)}
                        disabled={!workflowResponse}
                    >
                        <TuneIcon />
                    </IconButton>
                </Grid>
            </Grid>

            {error && (
                <Alert severity="error" style={{ marginTop: "20px" }}>
                    {error}
                </Alert>
            )}

            {workflowResponse && (
                <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {visibleColumns.map((column) => (
                                    <TableCell
                                        key={column}
                                        style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                                    >
                                        <TableSortLabel
                                            active={sortConfig.key === column}
                                            direction={sortConfig.direction}
                                            onClick={() => handleSort(column)}
                                        >
                                            {column}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {getFilteredAndSortedData().map((row, index) => (
                                <TableRow key={index}>
                                    {visibleColumns.map((column) => (
                                        <TableCell key={column}>{row[column]}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Configure Table</DialogTitle>
                <DialogContent>
                    <Typography variant="h6" gutterBottom>
                        Visible Columns
                    </Typography>
                    {columns.map((column) => (
                        <FormControlLabel
                            key={column}
                            control={
                                <Checkbox
                                    checked={visibleColumns.includes(column)}
                                    onChange={() => handleColumnVisibilityChange(column)}
                                />
                            }
                            label={column}
                        />
                    ))}

                    <Typography variant="h6" gutterBottom style={{ marginTop: "20px" }}>
                        Filters
                    </Typography>
                    {filters.map((filter, index) => (
                        <Grid container spacing={2} key={index} alignItems="center" style={{ marginBottom: "10px" }}>
                            <Grid item xs={4}>
                                <Select
                                    value={filter.column}
                                    onChange={(e) => updateFilter(index, "column", e.target.value)}
                                    fullWidth
                                    displayEmpty
                                >
                                    <MenuItem value="">Select Column</MenuItem>
                                    {columns.map((column) => (
                                        <MenuItem key={column} value={column}>
                                            {column}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item xs={3}>
                                <Select
                                    value={filter.condition}
                                    onChange={(e) => updateFilter(index, "condition", e.target.value)}
                                    fullWidth
                                    displayEmpty
                                >
                                    <MenuItem value="">Select Condition</MenuItem>
                                    <MenuItem value="equals">Equals</MenuItem>
                                    <MenuItem value="contains">Contains</MenuItem>
                                    <MenuItem value="greaterThan">Greater Than</MenuItem>
                                    <MenuItem value="lessThan">Less Than</MenuItem>
                                </Select>
                            </Grid>
                            <Grid item xs={4}>
                                {filter.column && uniqueColumnValues[filter.column] && (
                                    <Select
                                        value={filter.value}
                                        onChange={(e) => updateFilter(index, "value", e.target.value)}
                                        fullWidth
                                        displayEmpty
                                    >
                                        <MenuItem value="">Select Value</MenuItem>
                                        {uniqueColumnValues[filter.column].map((value) => (
                                            <MenuItem key={value} value={value}>
                                                {value}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                                {filter.column && !uniqueColumnValues[filter.column] && (
                                    <TextField
                                        fullWidth
                                        value={filter.value}
                                        onChange={(e) => updateFilter(index, "value", e.target.value)}
                                        type={typeof workflowResponse[0][filter.column] === "number" ? "number" : "text"}
                                    />
                                )}
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton onClick={() => removeFilter(index)}>
                                    <TuneIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Button onClick={addFilter} variant="outlined" color="primary">
                        Add Filter
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfigDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Paper>
    );
}