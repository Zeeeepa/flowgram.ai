import { injectable } from 'inversify';
import { 
  Workflow, 
  WorkflowNode, 
  NodeType, 
  Track, 
  Dependency, 
  DependencyType, 
  Condition, 
  ConditionOperator, 
  ResourceRequirement, 
  ResourceType 
} from '../core/types';
import { TokenType, Token, KEYWORDS } from './grammar';

/**
 * Parser for the workflow DSL
 */
@injectable()
export class DslParser {
  private tokens: Token[] = [];
  private current = 0;
  private line = 1;
  private column = 1;

  /**
   * Parse a DSL string into a workflow
   */
  parse(source: string): Workflow {
    this.tokenize(source);
    return this.parseWorkflow();
  }

  /**
   * Tokenize the source string
   */
  private tokenize(source: string): void {
    this.tokens = [];
    this.current = 0;
    this.line = 1;
    this.column = 1;

    let current = 0;
    
    while (current < source.length) {
      let char = source.charAt(current);
      
      // Handle whitespace
      if (/\s/.test(char)) {
        if (char === '\n') {
          this.line++;
          this.column = 1;
        } else {
          this.column++;
        }
        current++;
        continue;
      }
      
      // Handle comments
      if (char === '/' && source.charAt(current + 1) === '/') {
        // Single-line comment
        const start = current;
        current += 2; // Skip the //
        
        // Consume until end of line
        while (current < source.length && source.charAt(current) !== '\n') {
          current++;
        }
        
        const comment = source.substring(start, current);
        this.tokens.push({
          type: TokenType.COMMENT,
          value: comment,
          line: this.line,
          column: this.column
        });
        
        this.column += comment.length;
        continue;
      }
      
      if (char === '/' && source.charAt(current + 1) === '*') {
        // Multi-line comment
        const start = current;
        current += 2; // Skip the /*
        
        // Consume until */
        while (current < source.length && 
               !(source.charAt(current) === '*' && source.charAt(current + 1) === '/')) {
          if (source.charAt(current) === '\n') {
            this.line++;
            this.column = 1;
          } else {
            this.column++;
          }
          current++;
        }
        
        if (current < source.length) {
          current += 2; // Skip the */
        }
        
        const comment = source.substring(start, current);
        this.tokens.push({
          type: TokenType.COMMENT,
          value: comment,
          line: this.line,
          column: this.column
        });
        
        this.column += comment.length;
        continue;
      }
      
      // Handle symbols
      switch (char) {
        case '{':
          this.tokens.push({
            type: TokenType.LEFT_BRACE,
            value: '{',
            line: this.line,
            column: this.column
          });
          this.column++;
          current++;
          continue;
        case '}':
          this.tokens.push({
            type: TokenType.RIGHT_BRACE,
            value: '}',
            line: this.line,
            column: this.column
          });
          this.column++;
          current++;
          continue;
        case '(':
          this.tokens.push({
            type: TokenType.LEFT_PAREN,
            value: '(',
            line: this.line,
            column: this.column
          });
          this.column++;
          current++;
          continue;
        case ')':
          this.tokens.push({
            type: TokenType.RIGHT_PAREN,
            value: ')',
            line: this.line,
            column: this.column
          });
          this.column++;
          current++;
          continue;
        case '[':
          this.tokens.push({
            type: TokenType.LEFT_BRACKET,
            value: '[',
            line: this.line,
            column: this.column
          });
          this.column++;
          current++;
          continue;
        case ']':
          this.tokens.push({
            type: TokenType.RIGHT_BRACKET,
            value: ']',
            line: this.line,
            column: this.column
          });
          this.column++;
          current++;
          continue;
        case ':':
          this.tokens.push({
            type: TokenType.COLON,
            value: ':',
            line: this.line,
            column: this.column
          });
          this.column++;
          current++;
          continue;
        case ',':
          this.tokens.push({
            type: TokenType.COMMA,
            value: ',',
            line: this.line,
            column: this.column
          });
          this.column++;
          current++;
          continue;
      }
      
      // Handle arrow (->)
      if (char === '-' && source.charAt(current + 1) === '>') {
        this.tokens.push({
          type: TokenType.ARROW,
          value: '->',
          line: this.line,
          column: this.column
        });
        this.column += 2;
        current += 2;
        continue;
      }
      
      // Handle strings
      if (char === '"') {
        const start = current;
        current++; // Skip the opening "
        
        // Consume until closing "
        while (current < source.length && source.charAt(current) !== '"') {
          if (source.charAt(current) === '\\' && current + 1 < source.length) {
            // Handle escape sequences
            current += 2;
            this.column += 2;
          } else {
            if (source.charAt(current) === '\n') {
              this.line++;
              this.column = 1;
            } else {
              this.column++;
            }
            current++;
          }
        }
        
        if (current < source.length) {
          current++; // Skip the closing "
        }
        
        const value = source.substring(start + 1, current - 1);
        this.tokens.push({
          type: TokenType.STRING,
          value,
          line: this.line,
          column: this.column - value.length - 2
        });
        
        this.column++;
        continue;
      }
      
      // Handle numbers
      if (/[0-9]/.test(char)) {
        const start = current;
        
        // Consume digits
        while (current < source.length && /[0-9.]/.test(source.charAt(current))) {
          current++;
        }
        
        const value = source.substring(start, current);
        this.tokens.push({
          type: TokenType.NUMBER,
          value,
          line: this.line,
          column: this.column
        });
        
        this.column += value.length;
        continue;
      }
      
      // Handle identifiers and keywords
      if (/[a-zA-Z_]/.test(char)) {
        const start = current;
        
        // Consume alphanumeric characters and underscores
        while (current < source.length && /[a-zA-Z0-9_]/.test(source.charAt(current))) {
          current++;
        }
        
        const value = source.substring(start, current);
        const type = KEYWORDS[value] || TokenType.IDENTIFIER;
        
        this.tokens.push({
          type,
          value,
          line: this.line,
          column: this.column
        });
        
        this.column += value.length;
        continue;
      }
      
      // If we get here, we encountered an unexpected character
      throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.column}`);
    }
    
    // Add EOF token
    this.tokens.push({
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.column
    });
  }

  /**
   * Parse a workflow from tokens
   */
  private parseWorkflow(): Workflow {
    this.consume(TokenType.WORKFLOW, 'Expected workflow keyword');
    const name = this.parseString();
    this.consume(TokenType.LEFT_BRACE, 'Expected { after workflow name');
    
    const workflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name,
      nodes: [],
      dependencies: [],
      tracks: []
    };
    
    // Parse workflow properties and elements
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      if (this.match(TokenType.DESCRIPTION)) {
        workflow.description = this.parseString();
      } else if (this.match(TokenType.VERSION)) {
        workflow.version = this.parseString();
      } else if (this.match(TokenType.TRACK)) {
        const track = this.parseTrack();
        workflow.tracks.push(track);
      } else if (this.match(TokenType.START)) {
        const node = this.parseNode(NodeType.START);
        workflow.nodes.push(node);
      } else if (this.match(TokenType.END)) {
        const node = this.parseNode(NodeType.END);
        workflow.nodes.push(node);
      } else if (this.match(TokenType.TASK)) {
        const node = this.parseNode(NodeType.TASK);
        workflow.nodes.push(node);
      } else if (this.match(TokenType.DECISION)) {
        const node = this.parseNode(NodeType.DECISION);
        workflow.nodes.push(node);
      } else if (this.match(TokenType.SYNC)) {
        const node = this.parseNode(NodeType.SYNC_POINT);
        workflow.nodes.push(node);
      } else if (this.match(TokenType.DEPENDENCIES)) {
        const dependencies = this.parseDependencies();
        workflow.dependencies = dependencies;
      } else {
        // Skip comments
        if (this.check(TokenType.COMMENT)) {
          this.advance();
        } else {
          throw this.error(this.peek(), 'Expected workflow element');
        }
      }
    }
    
    this.consume(TokenType.RIGHT_BRACE, 'Expected } after workflow definition');
    
    return workflow;
  }

  /**
   * Parse a track definition
   */
  private parseTrack(): Track {
    const name = this.parseString();
    this.consume(TokenType.LEFT_BRACE, 'Expected { after track name');
    
    const track: Track = {
      id: `track-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name,
      nodeIds: []
    };
    
    // Parse track properties
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      if (this.match(TokenType.DESCRIPTION)) {
        track.description = this.parseString();
      } else {
        // Skip comments
        if (this.check(TokenType.COMMENT)) {
          this.advance();
        } else {
          throw this.error(this.peek(), 'Expected track property');
        }
      }
    }
    
    this.consume(TokenType.RIGHT_BRACE, 'Expected } after track definition');
    
    return track;
  }

  /**
   * Parse a node definition
   */
  private parseNode(type: NodeType): WorkflowNode {
    const name = this.parseString();
    this.consume(TokenType.LEFT_BRACE, `Expected { after ${type} node name`);
    
    const node: any = {
      id: `node-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type,
      name
    };
    
    // Parse node properties
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      if (this.match(TokenType.DESCRIPTION)) {
        node.description = this.parseString();
      } else if (this.match(TokenType.TRACK)) {
        // This is a reference to a track by name, will need to be resolved later
        node.trackName = this.parseString();
      } else if (this.match(TokenType.TYPE)) {
        if (type === NodeType.TASK) {
          node.taskType = this.parseString();
        } else {
          throw this.error(this.peek(), `Type property not valid for ${type} nodes`);
        }
      } else if (this.match(TokenType.PARAMETERS)) {
        node.parameters = this.parseObject();
      } else if (this.match(TokenType.RESOURCES)) {
        node.resourceRequirements = this.parseResources();
      } else if (this.match(TokenType.CONDITION)) {
        if (type === NodeType.DECISION) {
          if (!node.conditions) {
            node.conditions = [];
          }
          const condition = this.parseCondition();
          node.conditions.push(condition);
        } else {
          throw this.error(this.peek(), `Condition property not valid for ${type} nodes`);
        }
      } else if (this.match(TokenType.DEFAULT)) {
        if (type === NodeType.DECISION) {
          node.defaultTargetName = this.parseString();
        } else {
          throw this.error(this.peek(), `Default property not valid for ${type} nodes`);
        }
      } else if (this.match(TokenType.WAIT_FOR_ALL)) {
        if (type === NodeType.SYNC_POINT) {
          if (!node.config) {
            node.config = { requiredSources: [] };
          }
          node.config.waitForAll = this.parseBoolean();
        } else {
          throw this.error(this.peek(), `wait_for_all property not valid for ${type} nodes`);
        }
      } else if (this.match(TokenType.TIMEOUT)) {
        if (type === NodeType.SYNC_POINT) {
          if (!node.config) {
            node.config = { requiredSources: [] };
          }
          node.config.timeout = this.parseNumber();
        } else if (type === NodeType.TASK) {
          node.timeout = this.parseNumber();
        } else {
          throw this.error(this.peek(), `timeout property not valid for ${type} nodes`);
        }
      } else {
        // Skip comments
        if (this.check(TokenType.COMMENT)) {
          this.advance();
        } else {
          throw this.error(this.peek(), `Expected ${type} node property`);
        }
      }
    }
    
    this.consume(TokenType.RIGHT_BRACE, `Expected } after ${type} node definition`);
    
    return node;
  }

  /**
   * Parse dependencies section
   */
  private parseDependencies(): Dependency[] {
    this.consume(TokenType.LEFT_BRACE, 'Expected { after dependencies keyword');
    
    const dependencies: Dependency[] = [];
    
    // Parse dependency definitions
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      if (this.check(TokenType.STRING)) {
        const sourceName = this.parseString();
        this.consume(TokenType.ARROW, 'Expected -> in dependency definition');
        const targetName = this.parseString();
        
        const dependency: any = {
          sourceId: sourceName, // Will be resolved to actual ID later
          targetId: targetName, // Will be resolved to actual ID later
          type: DependencyType.SEQUENTIAL
        };
        
        // Check for conditional dependency
        if (this.match(TokenType.WHEN)) {
          dependency.type = DependencyType.CONDITIONAL;
          dependency.condition = {
            leftOperand: this.parseIdentifier(),
            operator: this.parseOperator(),
            rightOperand: this.parseValue()
          };
        } else if (this.match(TokenType.DEFAULT)) {
          dependency.type = DependencyType.CONDITIONAL;
          dependency.isDefault = true;
        }
        
        dependencies.push(dependency);
      } else {
        // Skip comments
        if (this.check(TokenType.COMMENT)) {
          this.advance();
        } else {
          throw this.error(this.peek(), 'Expected dependency definition');
        }
      }
    }
    
    this.consume(TokenType.RIGHT_BRACE, 'Expected } after dependencies section');
    
    return dependencies;
  }

  /**
   * Parse a condition for a decision node
   */
  private parseCondition(): Condition {
    const conditionStr = this.parseString();
    this.consume(TokenType.THEN, 'Expected then keyword after condition');
    const targetName = this.parseString();
    
    // Simple parsing of condition string
    // In a real implementation, this would use a proper expression parser
    const parts = conditionStr.split(/\s+/);
    if (parts.length !== 3) {
      throw new Error(`Invalid condition format: ${conditionStr}`);
    }
    
    const [leftOperand, operatorStr, rightOperandStr] = parts;
    
    let operator: ConditionOperator;
    switch (operatorStr) {
      case '==':
      case '=':
      case 'equals':
        operator = ConditionOperator.EQUALS;
        break;
      case '!=':
      case 'not_equals':
        operator = ConditionOperator.NOT_EQUALS;
        break;
      case '>':
      case 'greater_than':
        operator = ConditionOperator.GREATER_THAN;
        break;
      case '<':
      case 'less_than':
        operator = ConditionOperator.LESS_THAN;
        break;
      case '>=':
      case 'greater_than_or_equals':
        operator = ConditionOperator.GREATER_THAN_OR_EQUALS;
        break;
      case '<=':
      case 'less_than_or_equals':
        operator = ConditionOperator.LESS_THAN_OR_EQUALS;
        break;
      case 'contains':
        operator = ConditionOperator.CONTAINS;
        break;
      case 'not_contains':
        operator = ConditionOperator.NOT_CONTAINS;
        break;
      case 'starts_with':
        operator = ConditionOperator.STARTS_WITH;
        break;
      case 'ends_with':
        operator = ConditionOperator.ENDS_WITH;
        break;
      case 'regex':
        operator = ConditionOperator.REGEX;
        break;
      default:
        throw new Error(`Unknown operator: ${operatorStr}`);
    }
    
    // Parse right operand
    let rightOperand: string | number | boolean;
    if (rightOperandStr === 'true') {
      rightOperand = true;
    } else if (rightOperandStr === 'false') {
      rightOperand = false;
    } else if (/^[0-9]+(\.[0-9]+)?$/.test(rightOperandStr)) {
      rightOperand = parseFloat(rightOperandStr);
    } else {
      rightOperand = rightOperandStr;
    }
    
    return {
      leftOperand,
      operator,
      rightOperand,
      metadata: { targetName }
    };
  }

  /**
   * Parse resource requirements
   */
  private parseResources(): ResourceRequirement[] {
    this.consume(TokenType.LEFT_BRACE, 'Expected { after resources keyword');
    
    const resources: ResourceRequirement[] = [];
    
    // Parse resource definitions
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      if (this.check(TokenType.IDENTIFIER)) {
        const resourceTypeStr = this.parseIdentifier();
        this.consume(TokenType.COLON, 'Expected : after resource type');
        const amount = this.parseNumber();
        
        let resourceType: ResourceType;
        switch (resourceTypeStr) {
          case 'cpu':
            resourceType = ResourceType.CPU;
            break;
          case 'memory':
            resourceType = ResourceType.MEMORY;
            break;
          case 'gpu':
            resourceType = ResourceType.GPU;
            break;
          default:
            resourceType = ResourceType.CUSTOM;
        }
        
        resources.push({
          resourceType,
          amount,
          resourceId: resourceType === ResourceType.CUSTOM ? resourceTypeStr : undefined
        });
      } else {
        // Skip comments
        if (this.check(TokenType.COMMENT)) {
          this.advance();
        } else {
          throw this.error(this.peek(), 'Expected resource definition');
        }
      }
    }
    
    this.consume(TokenType.RIGHT_BRACE, 'Expected } after resources section');
    
    return resources;
  }

  /**
   * Parse an object (for parameters)
   */
  private parseObject(): Record<string, any> {
    this.consume(TokenType.LEFT_BRACE, 'Expected { after parameters keyword');
    
    const obj: Record<string, any> = {};
    
    // Parse object properties
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      if (this.check(TokenType.IDENTIFIER)) {
        const key = this.parseIdentifier();
        this.consume(TokenType.COLON, 'Expected : after parameter name');
        const value = this.parseValue();
        obj[key] = value;
      } else {
        // Skip comments
        if (this.check(TokenType.COMMENT)) {
          this.advance();
        } else {
          throw this.error(this.peek(), 'Expected parameter definition');
        }
      }
    }
    
    this.consume(TokenType.RIGHT_BRACE, 'Expected } after parameters section');
    
    return obj;
  }

  /**
   * Parse an array
   */
  private parseArray(): any[] {
    this.consume(TokenType.LEFT_BRACKET, 'Expected [ for array');
    
    const array: any[] = [];
    
    // Parse array elements
    while (!this.check(TokenType.RIGHT_BRACKET) && !this.isAtEnd()) {
      array.push(this.parseValue());
      
      if (this.check(TokenType.COMMA)) {
        this.advance();
      } else {
        break;
      }
    }
    
    this.consume(TokenType.RIGHT_BRACKET, 'Expected ] after array');
    
    return array;
  }

  /**
   * Parse a value (string, number, boolean, array, or object)
   */
  private parseValue(): any {
    if (this.check(TokenType.STRING)) {
      return this.parseString();
    } else if (this.check(TokenType.NUMBER)) {
      return this.parseNumber();
    } else if (this.check(TokenType.BOOLEAN)) {
      return this.parseBoolean();
    } else if (this.check(TokenType.LEFT_BRACKET)) {
      return this.parseArray();
    } else if (this.check(TokenType.LEFT_BRACE)) {
      return this.parseObject();
    } else {
      throw this.error(this.peek(), 'Expected value');
    }
  }

  /**
   * Parse a string
   */
  private parseString(): string {
    const token = this.consume(TokenType.STRING, 'Expected string');
    return token.value;
  }

  /**
   * Parse a number
   */
  private parseNumber(): number {
    const token = this.consume(TokenType.NUMBER, 'Expected number');
    return parseFloat(token.value);
  }

  /**
   * Parse a boolean
   */
  private parseBoolean(): boolean {
    const token = this.consume(TokenType.BOOLEAN, 'Expected boolean');
    return token.value === 'true';
  }

  /**
   * Parse an identifier
   */
  private parseIdentifier(): string {
    const token = this.consume(TokenType.IDENTIFIER, 'Expected identifier');
    return token.value;
  }

  /**
   * Parse an operator
   */
  private parseOperator(): ConditionOperator {
    const token = this.advance();
    
    switch (token.value) {
      case '==':
      case '=':
      case 'equals':
        return ConditionOperator.EQUALS;
      case '!=':
      case 'not_equals':
        return ConditionOperator.NOT_EQUALS;
      case '>':
      case 'greater_than':
        return ConditionOperator.GREATER_THAN;
      case '<':
      case 'less_than':
        return ConditionOperator.LESS_THAN;
      case '>=':
      case 'greater_than_or_equals':
        return ConditionOperator.GREATER_THAN_OR_EQUALS;
      case '<=':
      case 'less_than_or_equals':
        return ConditionOperator.LESS_THAN_OR_EQUALS;
      case 'contains':
        return ConditionOperator.CONTAINS;
      case 'not_contains':
        return ConditionOperator.NOT_CONTAINS;
      case 'starts_with':
        return ConditionOperator.STARTS_WITH;
      case 'ends_with':
        return ConditionOperator.ENDS_WITH;
      case 'regex':
        return ConditionOperator.REGEX;
      default:
        throw this.error(token, 'Expected operator');
    }
  }

  /**
   * Check if the current token is of the expected type
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  /**
   * Advance to the next token if the current token is of the expected type
   */
  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  /**
   * Consume the current token if it's of the expected type, otherwise throw an error
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  /**
   * Advance to the next token and return the previous one
   */
  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  /**
   * Check if we've reached the end of the token stream
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * Get the current token
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * Get the previous token
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * Create an error with the given token and message
   */
  private error(token: Token, message: string): Error {
    return new Error(`${message} at line ${token.line}, column ${token.column}`);
  }
}

