import React, { useState, useRef, useEffect } from "react";
import {
  CssBaseline,
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardMedia,
  CardContent,
  LinearProgress,
  Alert,
  IconButton,
  Chip,
  Divider,
  useMediaQuery,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/CloudUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import ScienceIcon from "@mui/icons-material/Science";
import PercentIcon from "@mui/icons-material/Percent";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4caf50", // green for plants
      light: "#80e27e",
      dark: "#087f23",
    },
    secondary: {
      main: "#ff9800", // potato orange
      light: "#ffc947",
      dark: "#c66900",
    },
    background: {
      default: "#f8f9fa",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 12 },
});

export default function PotatoDiseaseClassifier() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setUploadProgress((p) => {
          const next = p + Math.random() * 10;
          return next >= 95 ? 95 : next;
        });
      }, 300);
    } else {
      setUploadProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    } else {
      setError("Please select a valid image file (JPG, PNG, JPEG)");
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPrediction(data);
      setUploadProgress(100);
    } catch (err) {
      setError(`Classification failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getConfidenceColor = (confidence) => {
    const val = confidence * 100;
    if (val > 80) return "success";
    if (val > 60) return "primary";
    if (val > 40) return "warning";
    return "error";
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          minHeight: "100vh",
          width: "100vw",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
          background:
            "linear-gradient(135deg, #e8f5e9 0%, #fff8e1 100%)",
          overflowX: "hidden",
          gap: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(45deg, #4caf50, #ff9800)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
          }}
        >
          🥔 Potato Disease Classifier
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          textAlign="center"
          sx={{ maxWidth: 600 }}
        >
          Upload a potato plant leaf image and our AI will identify diseases with high precision
        </Typography>

        {/* Upload Box */}
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 600,
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            bgcolor: dragActive ? "rgba(76,175,80,0.1)" : "white",
            border: (theme) =>
              `2px dashed ${dragActive ? theme.palette.primary.main : "#ccc"}`,
            cursor: "pointer",
            transition: "all 0.3s ease",
            textAlign: "center",
            userSelect: "none",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon
            color="primary"
            sx={{
              fontSize: 60,
              mb: 2,
              animation: dragActive ? "pulse 1.5s infinite" : "none",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.1)" },
                "100%": { transform: "scale(1)" },
              },
            }}
          />
          <Typography variant="h6" fontWeight={600} mb={1}>
            {dragActive ? "Drop your image here" : "Drag & Drop or Click to Upload"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Supported formats: JPG, PNG, JPEG
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
            <Chip size="small" label="Early Blight" color="primary" variant="outlined" />
            <Chip size="small" label="Late Blight" color="primary" variant="outlined" />
            <Chip size="small" label="Healthy" color="primary" variant="outlined" />
          </Box>
        </Paper>

        {/* Preview */}
        {previewUrl && (
          <Card
            elevation={6}
            sx={{
              width: "100%",
              maxWidth: 600,
              borderRadius: 4,
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <CardMedia
              component="img"
              src={previewUrl}
              alt="Uploaded Preview"
              sx={{
                maxHeight: 360,
                objectFit: "contain",
                bgcolor: "#f5f5f5",
              }}
              onClick={reset}
              title="Click to remove image"
            />
          </Card>
        )}

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
            width: "100%",
            maxWidth: 600,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={loading ? <ScienceIcon /> : <ScienceIcon />}
            disabled={!image || loading}
            onClick={handleUpload}
            sx={{
              fontWeight: 600,
              px: 5,
              py: 1.5,
              flexGrow: 1,
            }}
          >
            {loading ? "Analyzing..." : "Analyze Disease"}
          </Button>
          {(image || prediction) && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={reset}
              sx={{ px: 5, py: 1.5, flexGrow: 1 }}
            >
              New Image
            </Button>
          )}
        </Box>

        {/* Loading Progress */}
        {loading && (
          <Box sx={{ width: "100%", maxWidth: 600 }}>
            <LinearProgress
              variant="indeterminate"
              color="secondary"
              sx={{ height: 8, borderRadius: 4, mt: 3 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              Analyzing image...
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon />}
            sx={{ maxWidth: 600, width: "100%", mt: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Prediction Results */}
        {prediction && (
          <Paper
            elevation={6}
            sx={{
              maxWidth: 600,
              width: "100%",
              mt: 4,
              p: 3,
              borderRadius: 4,
              bgcolor: "white",
              boxShadow:
                "0px 4px 20px rgba(76, 175, 80, 0.15), 0px 1px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  bgcolor: "rgba(76, 175, 80, 0.1)",
                  borderRadius: 3,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <LocalFloristIcon
                  color="primary"
                  sx={{ fontSize: 40 }}
                  aria-label="Diagnosis icon"
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    DIAGNOSIS
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.dark">
                    {prediction.class}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  bgcolor: "rgba(255, 152, 0, 0.1)",
                  borderRadius: 3,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <PercentIcon
                  color="secondary"
                  sx={{ fontSize: 40 }}
                  aria-label="Confidence icon"
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    CONFIDENCE
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="secondary.dark"
                    >
                      {(prediction.confidence * 100).toFixed(1)}%
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        prediction.confidence > 0.8
                          ? "High"
                          : prediction.confidence > 0.6
                          ? "Medium"
                          : "Low"
                      }
                      color={getConfidenceColor(prediction.confidence)}
                      sx={{ height: 22 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Recommendations:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {prediction.class === "Healthy"
                  ? "Your potato plant appears healthy! Continue with regular care and monitoring."
                  : prediction.class.includes("Early Blight")
                  ? "Early Blight detected. Remove affected leaves, improve air circulation, and consider applying appropriate fungicides."
                  : "Late Blight detected. This is a serious condition that spreads quickly. Remove affected plants, apply fungicide, and monitor neighboring plants closely."}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<ScienceIcon />}
              >
                Learn More About {prediction.class}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Footer */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 6, userSelect: "none" }}
          align="center"
        >
          Powered by TensorFlow • AI Model Accuracy: 96.5% • Last Updated: June 2023
        </Typography>
      </Box>
    </ThemeProvider>
  );
}
