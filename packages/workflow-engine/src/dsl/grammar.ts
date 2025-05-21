/**
 * Grammar definition for the workflow DSL
 * 
 * This defines the syntax for the domain-specific language used to define workflows.
 * The grammar follows a simple, human-readable format that can be parsed into
 * workflow objects.
 * 
 * Example workflow in DSL:
 * 
 * ```
 * workflow "Data Processing Pipeline" {
 *   description "Process and analyze data from multiple sources"
 *   version "1.0.0"
 *   
 *   // Define tracks for parallel execution
 *   track "Data Ingestion" {
 *     description "Ingest data from various sources"
 *   }
 *   
 *   track "Data Processing" {
 *     description "Process and transform data"
 *   }
 *   
 *   track "Data Analysis" {
 *     description "Analyze processed data"
 *   }
 *   
 *   // Define nodes
 *   start "Begin Pipeline" {
 *     track "Data Ingestion"
 *   }
 *   
 *   task "Load CSV Data" {
 *     track "Data Ingestion"
 *     type "data_loader"
 *     parameters {
 *       source_path: "/data/input/file.csv"
 *       delimiter: ","
 *     }
 *     resources {
 *       cpu: 2
 *       memory: 4096
 *     }
 *   }
 *   
 *   task "Load JSON Data" {
 *     track "Data Ingestion"
 *     type "data_loader"
 *     parameters {
 *       source_path: "/data/input/file.json"
 *     }
 *     resources {
 *       cpu: 1
 *       memory: 2048
 *     }
 *   }
 *   
 *   sync "Data Loaded" {
 *     track "Data Processing"
 *     wait_for_all true
 *     timeout 300000
 *   }
 *   
 *   task "Transform Data" {
 *     track "Data Processing"
 *     type "data_transformer"
 *     parameters {
 *       operations: ["normalize", "filter_outliers"]
 *     }
 *     resources {
 *       cpu: 4
 *       memory: 8192
 *     }
 *   }
 *   
 *   decision "Quality Check" {
 *     track "Data Processing"
 *     condition "quality_score > 0.8" then "Analyze Data"
 *     condition "quality_score > 0.5" then "Reprocess Data"
 *     default "Data Quality Error"
 *   }
 *   
 *   task "Reprocess Data" {
 *     track "Data Processing"
 *     type "data_transformer"
 *     parameters {
 *       operations: ["clean", "normalize", "filter_outliers"]
 *     }
 *     resources {
 *       cpu: 4
 *       memory: 8192
 *     }
 *   }
 *   
 *   task "Analyze Data" {
 *     track "Data Analysis"
 *     type "data_analyzer"
 *     parameters {
 *       analysis_type: "statistical"
 *     }
 *     resources {
 *       cpu: 8
 *       memory: 16384
 *       gpu: 1
 *     }
 *   }
 *   
 *   task "Generate Report" {
 *     track "Data Analysis"
 *     type "report_generator"
 *     parameters {
 *       format: "pdf"
 *       template: "standard_report"
 *     }
 *     resources {
 *       cpu: 2
 *       memory: 4096
 *     }
 *   }
 *   
 *   task "Data Quality Error" {
 *     track "Data Analysis"
 *     type "error_handler"
 *     parameters {
 *       error_type: "quality"
 *       notification: true
 *     }
 *     resources {
 *       cpu: 1
 *       memory: 1024
 *     }
 *   }
 *   
 *   end "Complete Pipeline" {
 *     track "Data Analysis"
 *   }
 *   
 *   // Define dependencies
 *   dependencies {
 *     "Begin Pipeline" -> "Load CSV Data"
 *     "Begin Pipeline" -> "Load JSON Data"
 *     "Load CSV Data" -> "Data Loaded"
 *     "Load JSON Data" -> "Data Loaded"
 *     "Data Loaded" -> "Transform Data"
 *     "Transform Data" -> "Quality Check"
 *     "Quality Check" -> "Analyze Data" when "quality_score > 0.8"
 *     "Quality Check" -> "Reprocess Data" when "quality_score > 0.5"
 *     "Quality Check" -> "Data Quality Error" default
 *     "Reprocess Data" -> "Analyze Data"
 *     "Analyze Data" -> "Generate Report"
 *     "Generate Report" -> "Complete Pipeline"
 *     "Data Quality Error" -> "Complete Pipeline"
 *   }
 * }
 * ```
 */

/**
 * Token types for the DSL lexer
 */
export enum TokenType {
  // Keywords
  WORKFLOW = 'WORKFLOW',
  TRACK = 'TRACK',
  TASK = 'TASK',
  DECISION = 'DECISION',
  SYNC = 'SYNC',
  START = 'START',
  END = 'END',
  DEPENDENCIES = 'DEPENDENCIES',
  RESOURCES = 'RESOURCES',
  PARAMETERS = 'PARAMETERS',
  CONDITION = 'CONDITION',
  THEN = 'THEN',
  WHEN = 'WHEN',
  DEFAULT = 'DEFAULT',
  DESCRIPTION = 'DESCRIPTION',
  VERSION = 'VERSION',
  TYPE = 'TYPE',
  WAIT_FOR_ALL = 'WAIT_FOR_ALL',
  TIMEOUT = 'TIMEOUT',
  
  // Literals
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  
  // Symbols
  LEFT_BRACE = 'LEFT_BRACE',
  RIGHT_BRACE = 'RIGHT_BRACE',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  LEFT_BRACKET = 'LEFT_BRACKET',
  RIGHT_BRACKET = 'RIGHT_BRACKET',
  ARROW = 'ARROW',
  COLON = 'COLON',
  COMMA = 'COMMA',
  
  // Other
  IDENTIFIER = 'IDENTIFIER',
  COMMENT = 'COMMENT',
  WHITESPACE = 'WHITESPACE',
  EOF = 'EOF'
}

/**
 * Token structure for the DSL lexer
 */
export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

/**
 * Keywords map for the DSL lexer
 */
export const KEYWORDS: Record<string, TokenType> = {
  'workflow': TokenType.WORKFLOW,
  'track': TokenType.TRACK,
  'task': TokenType.TASK,
  'decision': TokenType.DECISION,
  'sync': TokenType.SYNC,
  'start': TokenType.START,
  'end': TokenType.END,
  'dependencies': TokenType.DEPENDENCIES,
  'resources': TokenType.RESOURCES,
  'parameters': TokenType.PARAMETERS,
  'condition': TokenType.CONDITION,
  'then': TokenType.THEN,
  'when': TokenType.WHEN,
  'default': TokenType.DEFAULT,
  'description': TokenType.DESCRIPTION,
  'version': TokenType.VERSION,
  'type': TokenType.TYPE,
  'wait_for_all': TokenType.WAIT_FOR_ALL,
  'timeout': TokenType.TIMEOUT,
  'true': TokenType.BOOLEAN,
  'false': TokenType.BOOLEAN
};

